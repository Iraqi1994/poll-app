import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Survey,
  SurveyAnswer,
  SurveyQuestion,
  SurveyResults as SurveyResultsMap,
} from '../../models/survey';
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
      category: 'General',
      endsOn: row.end_date ?? '',
      status: isPast(row.end_date) ? 'completed' : 'published',
      questions: this.getQuestions(row.id),
    };
  });

  // Votes are wired in the next step; an empty map renders every results bar at 0%.
  readonly results = computed<SurveyResultsMap>(() => ({}));

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
}
