import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Survey,
  SurveyAnswer,
  SurveyQuestion,
  SurveyResults as SurveyResultsMap,
} from '../../models/survey';
import { VoteRow } from '../../interfaces/voteRow';
import { SurveyQuestionView } from '../../components/survey-question-view/survey-question-view';
import { SurveyResults } from '../../components/survey-results/survey-results';
import { SurveyStore } from '../../services/survey-store';
import { isPast } from '../../utils/dates';

@Component({
  selector: 'app-survey-view',
  imports: [RouterLink, DatePipe, SurveyQuestionView, SurveyResults],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {
  private readonly store = inject(SurveyStore);

  id = input<string>();

  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly survey = computed<Survey | null>(() => {
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

  readonly results = computed<SurveyResultsMap>(() => {
    const row = this.getRow();
    return row ? this.getResults(row.id) : {};
  });

  getRow() {
    const id = this.id();
    const row = this.store.surveys().find((s) => String(s.id) === id);
    return row;
  }

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

  getAnswers(questionId: number): SurveyAnswer[] {
    return this.store
      .options()
      .filter((option) => option.question_id === questionId)
      .map((option) => ({ id: String(option.id), text: option.text ?? '' }));
  }

  getResults(surveyId: number): SurveyResultsMap {
    const votes = this.store.votes().filter((vote) => vote.survey_id === surveyId);
    const votesPerQuestion = this.countVotesBy(votes, (vote) => vote.question_id);
    const votesPerOption = this.countVotesBy(votes, (vote) => vote.option_id);

    return this.toPercentages(votesPerOption, votesPerQuestion);
  }

  countVotesBy(votes: VoteRow[], keyOf: (vote: VoteRow) => number): Map<number, number> {
    const counts = new Map<number, number>();

    for (const vote of votes) {
      const key = keyOf(vote);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }

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

  toPercent(count: number, total: number): number {
    return Math.round((count / total) * 100);
  }
}
