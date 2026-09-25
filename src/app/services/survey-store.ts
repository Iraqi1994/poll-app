import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { Supabase } from './supabase';
import { LocalStore } from './local-store';
import { SurveyRow } from '../interfaces/surveyRow';
import { QuestionRow } from '../interfaces/questionRow';
import { OptionRow } from '../interfaces/optionRow';
import { VoteRow } from '../interfaces/voteRow';
import { CacheShape } from '../interfaces/cacheShape';
import { isPast } from '../utils/dates';

const CACHE_KEY = 'survey-store/v2';
const VOTES_DEBOUNCE_MS = 250;
const SURVEYS_DEBOUNCE_MS = 250;

/** The four datasets, in the order {@link SurveyStore.fetchAll} returns them. */
type Datasets = [SurveyRow[], QuestionRow[], OptionRow[], VoteRow[]];

/**
 * Central owner of every dataset read from Supabase. Components read its signals instead of
 * calling {@link Supabase} directly.
 *
 * On construction it hydrates synchronously from a single versioned `localStorage` snapshot
 * (so the UI paints immediately), then revalidates once from the network. Any change to the
 * datasets is written straight back to `localStorage` by a write-through effect, so the realtime
 * handler below only has to patch the signals.
 *
 * It also holds the app's single Supabase Realtime subscription on `votes`. Incoming events are
 * treated as "votes changed" rather than as data: each one schedules a debounced refetch of the
 * votes table, which keeps the cache from drifting and needs no `REPLICA IDENTITY FULL` to handle
 * deletes.
 */
@Injectable({ providedIn: 'root' })
export class SurveyStore implements OnDestroy {
  private readonly db = inject(Supabase);
  private readonly storage = inject(LocalStore);

  private stopVotesListener: (() => void) | null = null;
  private votesRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  private stopSurveysListener: (() => void) | null = null;
  private surveysRefreshTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly _surveys = signal<SurveyRow[]>([]);
  private readonly _questions = signal<QuestionRow[]>([]);
  private readonly _options = signal<OptionRow[]>([]);
  private readonly _votes = signal<VoteRow[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastLoadedAt = signal<number | null>(null);

  readonly surveys = this._surveys.asReadonly();
  readonly questions = this._questions.asReadonly();
  readonly options = this._options.asReadonly();
  readonly votes = this._votes.asReadonly();

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastLoadedAt = this._lastLoadedAt.asReadonly();

  readonly activeSurveys = computed(() => this._surveys().filter((s) => !isPast(s.end_date)));
  readonly pastSurveys = computed(() => this._surveys().filter((s) => isPast(s.end_date)));

  /**
   * Hydrates from the cache, registers the write-through effect, then kicks off the first
   * network load and both realtime subscriptions.
   */
  constructor() {
    this.loadFromCache();

    effect(() => {
      const snapshot: CacheShape = {
        version: 2,
        savedAt: Date.now(),
        surveys: this._surveys(),
        questions: this._questions(),
        options: this._options(),
        votes: this._votes(),
      };
      const hasData =
        snapshot.surveys.length > 0 ||
        snapshot.questions.length > 0 ||
        snapshot.options.length > 0 ||
        snapshot.votes.length > 0;
      if (hasData) {
        this.storage.set(CACHE_KEY, snapshot);
      }
    });

    this.refreshAsync();
    this.listenForVoteChanges();
    this.listenForSurveyChanges();
  }

  /** Cancels both pending refetches and tears down both realtime subscriptions. */
  ngOnDestroy(): void {
    this.cancelVotesRefresh();
    this.stopVotesListener?.();
    this.stopVotesListener = null;

    this.cancelSurveysRefresh();
    this.stopSurveysListener?.();
    this.stopSurveysListener = null;
  }

  /**
   * Reloads all four datasets, reporting failures through {@link SurveyStore.error} rather than
   * throwing.
   */
  async refreshAsync(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      this.applyAll(await this.fetchAll());
      this._lastLoadedAt.set(Date.now());
    } catch (error) {
      this._error.set(this.toMessage(error));
    } finally {
      this._loading.set(false);
    }
  }

  /** Reloads only the votes, which is what a realtime vote event needs. */
  async refreshVotesAsync(): Promise<void> {
    try {
      this._votes.set(await this.db.getVotesAsync());
    } catch (error) {
      this._error.set(this.toMessage(error));
    }
  }

  /** Reloads surveys with their questions and options, leaving the votes untouched. */
  async refreshSurveysAsync(): Promise<void> {
    try {
      const [surveys, questions, options] = await Promise.all([
        this.db.getSurveysAsync(),
        this.db.getQuestionsAsync(),
        this.db.getOptionsAsync(),
      ]);

      this._surveys.set(surveys);
      this._questions.set(questions);
      this._options.set(options);
    } catch (error) {
      this._error.set(this.toMessage(error));
    }
  }

  /** Fetches all four datasets in parallel. */
  fetchAll(): Promise<Datasets> {
    return Promise.all([
      this.db.getSurveysAsync(),
      this.db.getQuestionsAsync(),
      this.db.getOptionsAsync(),
      this.db.getVotesAsync(),
    ]);
  }

  /** Writes a fetched set of datasets into the signals. */
  applyAll([surveys, questions, options, votes]: Datasets): void {
    this._surveys.set(surveys);
    this._questions.set(questions);
    this._options.set(options);
    this._votes.set(votes);
  }

  /** Starts the votes subscription, refetching on both changes and reconnects. */
  listenForVoteChanges(): void {
    this.stopVotesListener = this.db.onVotesChanged(
      () => this.scheduleVotesRefresh(),
      () => this.scheduleVotesRefresh(),
    );
  }

  /** Queues a votes refetch, replacing any pending one so bursts collapse into a single call. */
  scheduleVotesRefresh(): void {
    this.cancelVotesRefresh();
    this.votesRefreshTimer = setTimeout(() => {
      this.votesRefreshTimer = null;
      void this.refreshVotesAsync();
    }, VOTES_DEBOUNCE_MS);
  }

  /** Drops any pending votes refetch. */
  cancelVotesRefresh(): void {
    if (this.votesRefreshTimer === null) {
      return;
    }

    clearTimeout(this.votesRefreshTimer);
    this.votesRefreshTimer = null;
  }

  /** Starts the surveys subscription, refetching on both changes and reconnects. */
  listenForSurveyChanges(): void {
    this.stopSurveysListener = this.db.onSurveysChanged(
      () => this.scheduleSurveysRefresh(),
      () => this.scheduleSurveysRefresh(),
    );
  }

  /** Queues a surveys refetch, replacing any pending one so bursts collapse into a single call. */
  scheduleSurveysRefresh(): void {
    this.cancelSurveysRefresh();
    this.surveysRefreshTimer = setTimeout(() => {
      this.surveysRefreshTimer = null;
      void this.refreshSurveysAsync();
    }, SURVEYS_DEBOUNCE_MS);
  }

  /** Drops any pending surveys refetch. */
  cancelSurveysRefresh(): void {
    if (this.surveysRefreshTimer === null) {
      return;
    }

    clearTimeout(this.surveysRefreshTimer);
    this.surveysRefreshTimer = null;
  }

  /** Reduces a thrown value to a message suitable for {@link SurveyStore.error}. */
  toMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /** Hydrates the signals from the cached snapshot, ignoring a missing or outdated one. */
  loadFromCache(): void {
    const cached = this.storage.get<CacheShape>(CACHE_KEY);
    if (!cached || cached.version !== 2) {
      return;
    }
    this._surveys.set(cached.surveys ?? []);
    this._questions.set(cached.questions ?? []);
    this._options.set(cached.options ?? []);
    this._votes.set(cached.votes ?? []);
    this._lastLoadedAt.set(cached.savedAt ?? null);
  }
}
