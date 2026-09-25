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
  host = inject<ElementRef<HTMLElement>>(ElementRef);

  categoryControl = input.required<FormControl<SurveyCategory | ''>>();

  categories = SELECTABLE_CATEGORIES;
  open = signal(false);

  /** The currently selected category, or the empty string when none is chosen. */
  get value(): SurveyCategory | '' {
    return this.categoryControl().value;
  }

  /** Whether the control should show its error, which is only after the user has touched it. */
  get invalid(): boolean {
    const control = this.categoryControl();
    return !control.valid && control.touched;
  }

  /** Whether the bound control is disabled. */
  get disabled(): boolean {
    return this.categoryControl().disabled;
  }

  /** Opens or closes the dropdown, doing nothing while disabled. */
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

  /** Closes the dropdown, marking the control touched so a missing choice shows its error. */
  close(): void {
    if (this.open()) {
      this.categoryControl().markAsTouched();
    }
    this.open.set(false);
  }

  /** Stores `category` as the choice and closes the dropdown. */
  select(category: SurveyCategory): void {
    this.setValue(category);
    this.close();
  }

  /** Resets the choice back to none. */
  clear(): void {
    this.setValue('');
  }

  /** Closes the dropdown when the click landed outside this component. */
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  /** Writes a value to the bound control and marks it touched. */
  setValue(category: SurveyCategory | ''): void {
    const control = this.categoryControl();
    control.setValue(category);
    control.markAsTouched();
  }
}
