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
  store = inject(SurveyStore);

  loading = this.store.loading;
  error = this.store.error;

  tab = signal<SurveyTab>('active');
  category = signal<SurveyCategory>(ALL_SURVEYS);

  noData = computed(() => this.store.surveys().length === 0);

  tabSurveys = computed(() =>
    this.tab() === 'active' ? this.store.activeSurveys() : this.store.pastSurveys(),
  );

  surveys = computed(() =>
    this.category() === ALL_SURVEYS
      ? this.tabSurveys()
      : this.tabSurveys().filter((survey) => survey.category === this.category()),
  );

  /** Switches the grid between the active and past surveys. */
  selectTab(tab: SurveyTab): void {
    this.tab.set(tab);
  }

  /** Narrows the grid to one category, or to all surveys. */
  selectCategory(category: SurveyCategory): void {
    this.category.set(category);
  }
}
