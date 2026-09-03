import { Component, inject } from '@angular/core';
import { ActiveSurvey } from './active-survey/survey';
import { SurveyStore } from '../../services/survey-store';

@Component({
  selector: 'app-active-surveys',
  imports: [ActiveSurvey],
  templateUrl: './active-surveys.html',
  styleUrl: './active-surveys.scss',
})
export class ActiveSurveys {
  private readonly store = inject(SurveyStore);

  readonly surveys = this.store.surveys;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
}
