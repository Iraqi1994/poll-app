import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Survey,
  SurveyAnswer,
  SurveyQuestion,
  SurveyResults as SurveyResultsMap,
} from '../../models/survey';
import { VoteRow } from '../../interfaces/voteRow';
import { SelectedAnswer } from '../../interfaces/selectedAnswer';
import { SurveyQuestionView } from '../../components/survey-question-view/survey-question-view';
import { SurveyResults } from '../../components/survey-results/survey-results';
import { NewSurveyButton } from '../../components/new-survey-button/new-survey-button';
import { SurveyStore } from '../../services/survey-store';
import { Voting } from '../../services/voting';
import { Voter } from '../../services/voter';
import { isPast } from '../../utils/dates';

@Component({
  selector: 'app-survey-view',
  imports: [RouterLink, DatePipe, SurveyQuestionView, SurveyResults, NewSurveyButton],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {
  store = inject(SurveyStore);
  voting = inject(Voting);
  voter = inject(Voter);

  id = input<string>();

  loading = this.store.loading;
  error = this.store.error;

  selections = signal<Record<string, string[]>>({});
  submitting = signal(false);
  voteError = signal<string | null>(null);

  survey = computed<Survey | null>(() => {
    const row = this.getRow();
    if (!row) return null;

    return {
      id: String(row.id),
      title: row.name ?? 'Untitled survey',
      description: row.description ?? '',
      category: row.category ?? 'Uncategorized',
      endsOn: row.end_date ?? '',
      status: isPast(row.end_date) ? 'completed' : 'published',
      questions: this.getQuestions(row.id),
    };
  });

  results = computed<SurveyResultsMap>(() => {
    const row = this.getRow();
    return row ? this.getResults(row.id) : {};
  });

  surveyId = computed(() => this.getRow()?.id ?? null);

  myAnswerIds = computed<string[]>(() => {
    const surveyId = this.surveyId();
    if (surveyId === null) return [];

    return this.store
      .votes()
      .filter((vote) => vote.survey_id === surveyId && vote.voter_id === this.voter.id)
      .map((vote) => String(vote.option_id));
  });

  hasVoted = computed(() => {
    const surveyId = this.surveyId();
    const votedLocally = surveyId !== null && this.voting.hasVoted(surveyId);
    return votedLocally || this.myAnswerIds().length > 0;
  });

  closed = computed(() => this.survey()?.status === 'completed');

  locked = computed(() => this.hasVoted() || this.submitting() || this.closed());

  selectedCount = computed(() =>
    Object.values(this.selections()).reduce((total, ids) => total + ids.length, 0),
  );

  canSubmit = computed(() => !this.locked() && this.selectedCount() > 0);

  completeLabel = computed(() => {
    if (this.hasVoted()) return 'Already voted';
    if (this.submitting()) return 'Submitting…';
    if (this.closed()) return 'Survey closed';
    return 'Complete survey';
  });

  /**
   * Checks with the backend whether this voter already answered, whenever the resolved survey
   * changes, so a vote cast elsewhere locks the form here too.
   */
  constructor() {
    effect(() => {
      const surveyId = this.surveyId();
      if (surveyId !== null) {
        untracked(() => void this.voting.syncVotedAsync(surveyId));
      }
    });
  }

  /** Finds the survey row matching the route's `id`, or `undefined` while it is not loaded. */
  getRow() {
    const id = this.id();
    const row = this.store.surveys().find((s) => String(s.id) === id);
    return row;
  }

  /** Builds the view models for a survey's questions, each with its answers. */
  getQuestions(surveyId: number): SurveyQuestion[] {
    return this.store
      .questions()
      .filter((question) => question.survey_id === surveyId)
      .map((question) => ({
        id: String(question.id),
        text: question.text ?? '',
        allowMultiple: question.type === 'multiple',
        answers: this.getAnswers(question.id),
      }));
  }

  /** Builds the view models for one question's answer options. */
  getAnswers(questionId: number): SurveyAnswer[] {
    return this.store
      .options()
      .filter((option) => option.question_id === questionId)
      .map((option) => ({ id: String(option.id), text: option.text ?? '' }));
  }

  /** Tallies a survey's votes and returns each option's share of its own question. */
  getResults(surveyId: number): SurveyResultsMap {
    const votes = this.store.votes().filter((vote) => vote.survey_id === surveyId);
    const votesPerQuestion = this.countVotesBy(votes, (vote) => vote.question_id);
    const votesPerOption = this.countVotesBy(votes, (vote) => vote.option_id);

    return this.toPercentages(votesPerOption, votesPerQuestion);
  }

  /** Counts the votes grouped by whichever id `keyOf` returns. */
  countVotesBy(votes: VoteRow[], keyOf: (vote: VoteRow) => number): Map<number, number> {
    const counts = new Map<number, number>();

    for (const vote of votes) {
      const key = keyOf(vote);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }

  /**
   * Converts the per-option counts to percentages of their question's total. Options whose
   * question has no votes are left out, so the caller reads them as 0.
   */
  toPercentages(
    votesPerOption: Map<number, number>,
    votesPerQuestion: Map<number, number>,
  ): SurveyResultsMap {
    const results: SurveyResultsMap = {};

    for (const option of this.store.options()) {
      const total = votesPerQuestion.get(option.question_id ?? -1) ?? 0;
      if (total === 0) continue;

      results[String(option.id)] = this.toPercent(votesPerOption.get(option.id) ?? 0, total);
    }

    return results;
  }

  /** Returns `count` as a whole-number percentage of `total`. */
  toPercent(count: number, total: number): number {
    return Math.round((count / total) * 100);
  }

  /** The answer ids to show as chosen: the submitted vote once cast, the pending picks before. */
  selectedFor(questionId: string): string[] {
    return this.hasVoted() ? this.myAnswerIds() : (this.selections()[questionId] ?? []);
  }

  /** Adds or removes an answer from the pending selection, honouring the question's type. */
  onAnswerToggled(question: SurveyQuestion, answerId: string): void {
    const current = this.selectedFor(question.id);
    const next = question.allowMultiple
      ? this.toggleMany(current, answerId)
      : this.toggleOne(current, answerId);

    this.selections.update((all) => ({ ...all, [question.id]: next }));
  }

  /** Toggles `answerId` within a multiple-choice selection, keeping the others. */
  toggleMany(current: string[], answerId: string): string[] {
    return current.includes(answerId)
      ? current.filter((id) => id !== answerId)
      : [...current, answerId];
  }

  /** Toggles `answerId` as the single choice, clearing it when picked again. */
  toggleOne(current: string[], answerId: string): string[] {
    return current.includes(answerId) ? [] : [answerId];
  }

  /** Handles the complete-survey press, ignoring it while the form is locked or empty. */
  async onCompleteAsync(): Promise<void> {
    const surveyId = this.surveyId();
    if (surveyId === null || !this.canSubmit()) return;

    this.submitting.set(true);
    this.voteError.set(null);
    await this.submitVotesAsync(surveyId);
    this.submitting.set(false);
  }

  /** Casts the pending selections, reporting a failure through {@link voteError}. */
  async submitVotesAsync(surveyId: number): Promise<void> {
    try {
      await this.voting.castVotesAsync(surveyId, this.toSelectedAnswers());
    } catch (error) {
      this.voteError.set(this.toMessage(error));
    }
  }

  /** Flattens the pending selections into one entry per chosen answer, with numeric ids. */
  toSelectedAnswers(): SelectedAnswer[] {
    return Object.entries(this.selections()).flatMap(([questionId, answerIds]) =>
      answerIds.map((answerId) => ({
        questionId: Number(questionId),
        optionId: Number(answerId),
      })),
    );
  }

  /** Reduces a thrown value to a message suitable for {@link voteError}. */
  toMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
