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

  // Route param `survey/:id`.
  id = input<string>();

  readonly loading = this.store.loading;
  readonly error = this.store.error;

  /** The requested survey assembled from the store's flat signals, or `null` when not found. */
  readonly survey = computed<Survey | null>(() => {
    const id = this.id();
    const row = this.store.surveys().find((s) => String(s.id) === id);
    if (!row) {
      return null;
    }

    const questions: SurveyQuestion[] = this.store
      .questions()
      .filter((q) => q.survey_id === row.id)
      .map((q) => ({
        id: String(q.id),
        text: q.text ?? '',
        allowMultiple: q.type === 'multiple',
        answers: this.store
          .options()
          .filter((o) => o.question_id === q.id)
          .map((o) => ({ id: String(o.id), text: o.text ?? '' })),
      }));

    return {
      id: String(row.id),
      title: row.name ?? 'Untitled survey',
      description: row.description ?? '',
      // No category column yet — placeholder until one exists.
      category: 'General',
      endsOn: row.end_date ?? '',
      status: isPast(row.end_date) ? 'completed' : 'published',
      questions,
    };
  });

  // Votes are wired in the next step; an empty map renders every results bar at 0%.
  readonly results = computed<SurveyResultsMap>(() => ({}));
}
