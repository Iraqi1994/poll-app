import { Component, computed, inject } from '@angular/core';
import { YourSurvey } from './survey/survey';
import { SurveyStore } from '../../services/survey-store';

@Component({
  selector: 'app-your-surveys',
  imports: [YourSurvey],
  templateUrl: './your-surveys.html',
  styleUrl: './your-surveys.scss',
})
export class YourSurveys {
  private readonly store = inject(SurveyStore);

  readonly loading = this.store.loading;
  readonly error = this.store.error;

  /** Still-open surveys, soonest deadline first. Open-ended ones sort last. */
  readonly endingSoon = computed(() =>
    [...this.store.activeSurveys()].sort((a, b) => {
      if (!a.end_date) {
        return b.end_date ? 1 : 0;
      }
      if (!b.end_date) {
        return -1;
      }
      return a.end_date.localeCompare(b.end_date);
    }),
  );
}
