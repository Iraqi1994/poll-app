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
  host = inject<ElementRef<HTMLElement>>(ElementRef);

  selected = input.required<SurveyCategory>();
  selectedChange = output<SurveyCategory>();

  categories = SURVEY_CATEGORIES;
  open = signal(false);

  label = computed(() =>
    this.selected() === ALL_SURVEYS ? 'Sort by categories' : this.selected(),
  );

  /** Opens the dropdown when closed, and closes it when open. */
  toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  /** Closes the dropdown. */
  close(): void {
    this.open.set(false);
  }

  /** Emits `category` to the parent and closes the dropdown. */
  select(category: SurveyCategory): void {
    this.selectedChange.emit(category);
    this.close();
  }

  /** Closes the dropdown when the click landed outside this component. */
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
