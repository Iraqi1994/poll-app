import { Component, ElementRef, inject, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';

import { SURVEY_CATEGORIES, SurveyCategory } from '../../models/survey';
import { DeleteButton } from '../delete-button/delete-button';

@Component({
  selector: 'app-category-select',
  imports: [DeleteButton],
  templateUrl: './category-select.html',
  styleUrl: './category-select.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class CategorySelect {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  categoryControl = input.required<FormControl<SurveyCategory | ''>>();

  readonly categories = SURVEY_CATEGORIES;
  readonly open = signal(false);

  get value(): SurveyCategory | '' {
    return this.categoryControl().value;
  }

  get disabled(): boolean {
    return this.categoryControl().disabled;
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }
    this.open.update((isOpen) => !isOpen);
  }

  close(): void {
    this.open.set(false);
  }

  select(category: SurveyCategory): void {
    this.setValue(category);
    this.close();
  }

  clear(): void {
    this.setValue('');
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  private setValue(category: SurveyCategory | ''): void {
    const control = this.categoryControl();
    control.setValue(category);
    control.markAsTouched();
  }
}
