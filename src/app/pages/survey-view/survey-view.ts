import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Survey, SurveyQuestion, SurveyResults as SurveyResultsMap } from '../../models/survey';
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
    const id = this.id();
    const row = this.store.surveys().find((s) => String(s.id) === id);
    if (!row) {
      return null;
    }

    const questions: SurveyQuestion[] = this.store
      .questions()
      .filter((question) => question.survey_id === row.id)
      .map((question) => ({
        id: String(question.id),
        text: question.text ?? '',
        allowMultiple: question.type === 'multiple',
        answers: this.store
          .options()
          .filter((option) => option.question_id === question.id)
          .map((option) => ({ id: String(option.id), text: option.text ?? '' })),
      }));

    return {
      id: String(row.id),
      title: row.name ?? 'Untitled survey',
      description: row.description ?? '',
      category: 'General',
      endsOn: row.end_date ?? '',
      status: isPast(row.end_date) ? 'completed' : 'published',
      questions,
    };
  });

  // Votes are wired in the next step; an empty map renders every results bar at 0%.
  readonly results = computed<SurveyResultsMap>(() => ({}));
}
