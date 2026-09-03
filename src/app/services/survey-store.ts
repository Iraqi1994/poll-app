import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Supabase } from './supabase';
import { LocalStore } from './local-store';
import { SurveyRow } from '../interfaces/surveyRow';
import { QuestionRow } from '../interfaces/questionRow';
import { OptionRow } from '../interfaces/optionRow';
import { VoteRow } from '../interfaces/voteRow';
import { CacheShape } from '../interfaces/cacheShape';
import { isPast } from '../utils/dates';

const CACHE_KEY = 'survey-store/v1';

/**
 * Central owner of every dataset read from Supabase. Components read its signals instead of
 * calling {@link Supabase} directly.
 *
 * On construction it hydrates synchronously from a single versioned `localStorage` snapshot
 * (so the UI paints immediately), then revalidates once from the network. Any change to the
 * datasets is written straight back to `localStorage` by a write-through effect, so a future
 * realtime handler only needs to patch the signals.
 */
@Injectable({ providedIn: 'root' })
export class SurveyStore {
  private readonly db = inject(Supabase);
  private readonly storage = inject(LocalStore);

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

  constructor() {
    this.loadFromCache();

    effect(() => {
      const snapshot: CacheShape = {
        version: 1,
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

    this.refresh();
  }

  async refresh(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const [surveys, questions, options, votes] = await Promise.all([
        this.db.getSurveysAsync(),
        this.db.getQuestionsAsync(),
        this.db.getOptionsAsync(),
        this.db.getVotesAsync(),
      ]);
      this._surveys.set(surveys);
      this._questions.set(questions);
      this._options.set(options);
      this._votes.set(votes);
      this._lastLoadedAt.set(Date.now());
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : String(error));
    } finally {
      this._loading.set(false);
    }
  }

  private loadFromCache(): void {
    const cached = this.storage.get<CacheShape>(CACHE_KEY);
    if (!cached || cached.version !== 1) {
      return;
    }
    this._surveys.set(cached.surveys ?? []);
    this._questions.set(cached.questions ?? []);
    this._options.set(cached.options ?? []);
    this._votes.set(cached.votes ?? []);
    this._lastLoadedAt.set(cached.savedAt ?? null);
  }
}
