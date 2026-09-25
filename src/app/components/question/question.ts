import { Component, input, output, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DeleteButton } from '../delete-button/delete-button';

@Component({
  selector: 'app-question',
  imports: [ReactiveFormsModule, DeleteButton],
  templateUrl: './question.html',
  styleUrl: './question.scss',
})
export class Question {
  questionGroup = input.required<FormGroup>();
  questionIndex = input<number>(1);
  required = input<boolean>(false);
  remove = output<void>();

  /** The question text control of the group passed in by the parent form. */
  get text(): FormControl {
    return this.questionGroup().get('text') as FormControl;
  }

  /** The nested array holding this question's answer controls. */
  get answers(): FormArray {
    return this.questionGroup().get('answers') as FormArray;
  }

  /** The answer controls, typed for the template's `@for` loop. */
  get answerControls(): FormControl[] {
    return this.answers.controls as FormControl[];
  }

  /** Current length of the question text, for the character counter. */
  get questionTextLength(): number {
    return this.questionGroup().get('text')?.value?.length ?? 0;
  }

  /** The validation message for the question text, worded for required and optional questions. */
  get textErrorMessage(): string {
    return this.required() ? 'The first question is required.' : 'Question text is required.';
  }

  notDeletableAttempts = signal<ReadonlySet<number>>(new Set());

  /** Returns the display letter for an answer at `index`, so 0 becomes `A`. */
  getAnswerLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /** Whether a delete was already refused for the answer at `index`. */
  isNotDeletable(index: number): boolean {
    return this.notDeletableAttempts().has(index);
  }

  /**
   * Returns the message to show under an answer, covering both a refused delete and a missing
   * value, or `null` when the answer is fine.
   */
  answerErrorMessage(index: number, control: FormControl): string | null {
    if (control.valid) {
      return null;
    }
    if (this.isNotDeletable(index)) {
      return `Answer ${this.getAnswerLabel(index)} cannot be deleted.`;
    }
    if (control.touched) {
      return `Answer ${this.getAnswerLabel(index)} is required.`;
    }
    return null;
  }

  /** Appends an empty, required answer control to the group. */
  addAnswer(): void {
    this.answers.push(new FormControl('', Validators.required));
  }

  /** Empties the question text control. */
  clearText(): void {
    this.questionGroup().get('text')?.setValue('');
  }

  /**
   * Removes the answer at `index`. The first two answers are the required minimum, so they are
   * flagged instead of removed.
   */
  removeAnswer(index: number): void {
    if (index < 2) {
      this.answerControls[index]?.markAsTouched();
      this.markNotDeletable(index);
      return;
    }
    this.answers.removeAt(index);
  }

  /** Records that a delete was refused for `index`, so the template can explain why. */
  markNotDeletable(index: number): void {
    this.notDeletableAttempts.update((attempts) => new Set(attempts).add(index));
  }

  /** Asks the parent to remove this question, unless it is the required first one. */
  onRemove(): void {
    if (this.required()) {
      this.text.markAsTouched();
      return;
    }
    this.remove.emit();
  }
}
