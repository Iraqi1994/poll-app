import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CategorySelect } from '../../components/category-select/category-select';
import { DeleteButton } from '../../components/delete-button/delete-button';
import { Question } from '../../components/question/question';
import { QuestionDraft } from '../../interfaces/surveyDraft';
import { SurveyDraft } from '../../interfaces/surveyDraft';
import { SurveyCategory } from '../../models/survey';
import { Publishing } from '../../services/publishing';

const REDIRECT_DELAY_MS = 2000;

@Component({
  selector: 'app-new-survey-form',
  imports: [ReactiveFormsModule, RouterLink, Question, DeleteButton, CategorySelect],
  templateUrl: './new-survey-form.html',
  styleUrl: './new-survey-form.scss',
})
export class NewSurveyForm implements OnDestroy {
  publishing = inject(Publishing);
  router = inject(Router);

  redirectTimer: ReturnType<typeof setTimeout> | null = null;

  today: string = new Date().toISOString().split('T')[0];

  submitting = signal(false);
  published = signal(false);
  publishError = signal<string | null>(null);

  publishLabel = computed(() => (this.submitting() ? 'Publishing…' : 'Publish'));

  surveyForm = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.minLength(3)] }),
    description: new FormControl('', { validators: [Validators.maxLength(200)] }),
    endDate: new FormControl(''),
    category: new FormControl<SurveyCategory | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    questions: new FormArray([this.createQuestion()]),
  });

  /** Clears the pending redirect so it cannot fire after the form is gone. */
  ngOnDestroy(): void {
    this.cancelRedirect();
  }

  /** The survey name control, used by the template for its validation message. */
  get name() {
    return this.surveyForm.get('name') as FormControl;
  }

  /** The array holding one group per question. */
  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  /** The question groups, typed for the `Question` child's required input. */
  get questionGroups(): FormGroup[] {
    return this.questions.controls as FormGroup[];
  }

  /** Builds one question group, pre-filled with the two required answer controls. */
  createQuestion(): FormGroup {
    return new FormGroup({
      text: new FormControl('', [Validators.required, Validators.maxLength(150)]),
      allowMultiple: new FormControl(false),
      answers: new FormArray([
        new FormControl('', Validators.required),
        new FormControl('', Validators.required),
      ]),
    });
  }

  /** Appends an empty question to the form. */
  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  /** Removes the question at `index`. The first question is required, so it is kept. */
  removeQuestion(index: number): void {
    if (index === 0) {
      return;
    }
    this.questions.removeAt(index);
  }

  /** Empties one of the survey's top-level text controls. */
  clearField(name: 'name' | 'endDate' | 'description'): void {
    this.surveyForm.get(name)?.setValue('');
  }

  /**
   * Handles the publish submit: ignores repeat presses, surfaces validation errors on an
   * invalid form, and otherwise saves while holding the button in its submitting state.
   */
  async onPublishAsync(): Promise<void> {
    if (this.submitting() || this.published()) {
      return;
    }

    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.publishError.set(null);
    await this.savePublishAsync();
    this.submitting.set(false);
  }

  /**
   * Publishes the draft, then shows the confirmation and schedules the redirect home. A failure
   * is reported through {@link publishError} rather than thrown.
   */
  async savePublishAsync(): Promise<void> {
    try {
      await this.publishing.publishSurveyAsync(this.toDraft());
      this.published.set(true);
      this.scheduleRedirect();
    } catch (error) {
      this.publishError.set(this.toMessage(error));
    }
  }

  /** Reads the whole form into a draft, trimming every text value. */
  toDraft(): SurveyDraft {
    return {
      name: this.trimmed(this.surveyForm.get('name')),
      description: this.trimmed(this.surveyForm.get('description')),
      category: this.trimmed(this.surveyForm.get('category')),
      endDate: this.trimmed(this.surveyForm.get('endDate')),
      questions: this.questionGroups.map((group) => this.toQuestionDraft(group)),
    };
  }

  /** Reads one question group into a draft question. */
  toQuestionDraft(group: FormGroup): QuestionDraft {
    return {
      text: this.trimmed(group.get('text')),
      allowMultiple: group.get('allowMultiple')?.value === true,
      answers: this.toAnswers(group),
    };
  }

  /** Reads a question group's answer controls into trimmed strings. */
  toAnswers(group: FormGroup): string[] {
    return (group.get('answers') as FormArray).controls.map((control) => this.trimmed(control));
  }

  /** Returns a control's value as a trimmed string, treating a missing control as empty. */
  trimmed(control: { value: unknown } | null): string {
    return String(control?.value ?? '').trim();
  }

  /** Starts the delayed redirect home, replacing any redirect already pending. */
  scheduleRedirect(): void {
    this.cancelRedirect();
    this.redirectTimer = setTimeout(() => {
      this.redirectTimer = null;
      void this.router.navigate(['/']);
    }, REDIRECT_DELAY_MS);
  }

  /** Drops a pending redirect. */
  cancelRedirect(): void {
    if (this.redirectTimer === null) {
      return;
    }

    clearTimeout(this.redirectTimer);
    this.redirectTimer = null;
  }

  /** Reduces a thrown value to a message suitable for {@link publishError}. */
  toMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
