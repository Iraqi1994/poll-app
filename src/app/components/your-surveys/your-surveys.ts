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
  store = inject(SurveyStore);

  loading = this.store.loading;
  error = this.store.error;

  endingSoon = computed(() =>
    [...this.store.activeSurveys()]
      .sort((a, b) => {
        if (!a.end_date) {
          return b.end_date ? 1 : 0;
        }
        if (!b.end_date) {
          return -1;
        }
        return a.end_date.localeCompare(b.end_date);
      })
      .slice(0, 4),
  );
}
