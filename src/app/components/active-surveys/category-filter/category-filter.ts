import { Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';

import { ALL_SURVEYS, SURVEY_CATEGORIES, SurveyCategory } from '../../../models/survey';

@Component({
  selector: 'app-category-filter',
  imports: [],
  templateUrl: './category-filter.html',
  styleUrl: './category-filter.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class CategoryFilter {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly selected = input.required<SurveyCategory>();
  readonly selectedChange = output<SurveyCategory>();

  readonly categories = SURVEY_CATEGORIES;
  readonly open = signal(false);

  readonly label = computed(() =>
    this.selected() === ALL_SURVEYS ? 'Sort by categories' : this.selected(),
  );

  toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  close(): void {
    this.open.set(false);
  }

  select(category: SurveyCategory): void {
    this.selectedChange.emit(category);
    this.close();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
