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

  get text(): FormControl {
    return this.questionGroup().get('text') as FormControl;
  }

  get answers(): FormArray {
    return this.questionGroup().get('answers') as FormArray;
  }

  get answerControls(): FormControl[] {
    return this.answers.controls as FormControl[];
  }

  get questionTextLength(): number {
    return this.questionGroup().get('text')?.value?.length ?? 0;
  }

  get textErrorMessage(): string {
    return this.required() ? 'The first question is required.' : 'Question text is required.';
  }

  notDeletableAttempts = signal<ReadonlySet<number>>(new Set());

  getAnswerLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  isNotDeletable(index: number): boolean {
    return this.notDeletableAttempts().has(index);
  }

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

  addAnswer(): void {
    this.answers.push(new FormControl('', Validators.required));
  }

  clearText(): void {
    this.questionGroup().get('text')?.setValue('');
  }

  removeAnswer(index: number): void {
    if (index < 2) {
      this.answerControls[index]?.markAsTouched();
      this.markNotDeletable(index);
      return;
    }
    this.answers.removeAt(index);
  }

  markNotDeletable(index: number): void {
    this.notDeletableAttempts.update((attempts) => new Set(attempts).add(index));
  }

  onRemove(): void {
    if (this.required()) {
      this.text.markAsTouched();
      return;
    }
    this.remove.emit();
  }
}
