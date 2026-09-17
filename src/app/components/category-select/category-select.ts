import { Component, ElementRef, inject, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';

import { SELECTABLE_CATEGORIES, SurveyCategory } from '../../models/survey';
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

  readonly categories = SELECTABLE_CATEGORIES;
  readonly open = signal(false);

  get value(): SurveyCategory | '' {
    return this.categoryControl().value;
  }

  get invalid(): boolean {
    const control = this.categoryControl();
    return !control.valid && control.touched;
  }

  get disabled(): boolean {
    return this.categoryControl().disabled;
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.open.set(true);
    }
  }

  close(): void {
    if (this.open()) {
      this.categoryControl().markAsTouched();
    }
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
