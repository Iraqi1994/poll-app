import { Component, computed, inject, signal } from '@angular/core';
import { ActiveSurvey } from './active-survey/active-survey';
import { CategoryFilter } from './category-filter/category-filter';
import { ALL_SURVEYS, SurveyCategory } from '../../models/survey';
import { SurveyStore } from '../../services/survey-store';

/** Which half of the store's surveys the grid is showing. */
export type SurveyTab = 'active' | 'past';

@Component({
  selector: 'app-active-surveys',
  imports: [ActiveSurvey, CategoryFilter],
  templateUrl: './active-surveys.html',
  styleUrl: './active-surveys.scss',
})
export class ActiveSurveys {
  private readonly store = inject(SurveyStore);

  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly tab = signal<SurveyTab>('active');
  readonly category = signal<SurveyCategory>(ALL_SURVEYS);

  readonly noData = computed(() => this.store.surveys().length === 0);

  private readonly tabSurveys = computed(() =>
    this.tab() === 'active' ? this.store.activeSurveys() : this.store.pastSurveys(),
  );

  readonly surveys = computed(() =>
    this.category() === ALL_SURVEYS
      ? this.tabSurveys()
      : this.tabSurveys().filter((survey) => survey.category === this.category()),
  );

  selectTab(tab: SurveyTab): void {
    this.tab.set(tab);
  }

  selectCategory(category: SurveyCategory): void {
    this.category.set(category);
  }
}
