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
const REQUIRED_ANSWER_COUNT = 2;

@Component({
  selector: 'app-new-survey-form',
  imports: [ReactiveFormsModule, RouterLink, Question, DeleteButton, CategorySelect],
  templateUrl: './new-survey-form.html',
  styleUrl: './new-survey-form.scss',
})
export class NewSurveyForm implements OnDestroy {
  private readonly publishing = inject(Publishing);
  private readonly router = inject(Router);

  private redirectTimer: ReturnType<typeof setTimeout> | null = null;

  today: string = new Date().toISOString().split('T')[0];

  readonly submitting = signal(false);
  readonly published = signal(false);
  readonly publishError = signal<string | null>(null);

  readonly publishLabel = computed(() => (this.submitting() ? 'Publishing…' : 'Publish'));

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

  ngOnDestroy(): void {
    this.cancelRedirect();
  }

  get name() {
    return this.surveyForm.get('name') as FormControl;
  }

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  get questionGroups(): FormGroup[] {
    return this.questions.controls as FormGroup[];
  }

  private createQuestion(): FormGroup {
    return new FormGroup({
      text: new FormControl('', [Validators.required, Validators.maxLength(150)]),
      allowMultiple: new FormControl(false),
      answers: new FormArray([
        new FormControl('', Validators.required),
        new FormControl('', Validators.required),
      ]),
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    if (index === 0) {
      return;
    }
    this.questions.removeAt(index);
  }

  clearField(name: 'name' | 'endDate' | 'description'): void {
    this.surveyForm.get(name)?.setValue('');
  }

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

  async savePublishAsync(): Promise<void> {
    try {
      await this.publishing.publishSurveyAsync(this.toDraft());
      this.published.set(true);
      this.scheduleRedirect();
    } catch (error) {
      this.publishError.set(this.toMessage(error));
    }
  }

  toDraft(): SurveyDraft {
    return {
      name: this.trimmed(this.surveyForm.get('name')),
      description: this.trimmed(this.surveyForm.get('description')),
      category: this.trimmed(this.surveyForm.get('category')),
      endDate: this.trimmed(this.surveyForm.get('endDate')),
      questions: this.questionGroups.map((group) => this.toQuestionDraft(group)),
    };
  }

  toQuestionDraft(group: FormGroup): QuestionDraft {
    return {
      text: this.trimmed(group.get('text')),
      allowMultiple: group.get('allowMultiple')?.value === true,
      answers: this.toAnswers(group),
    };
  }

  toAnswers(group: FormGroup): string[] {
    return (group.get('answers') as FormArray).controls
      .map((control) => this.trimmed(control))
      .filter((answer, index) => index < REQUIRED_ANSWER_COUNT || answer.length > 0);
  }

  trimmed(control: { value: unknown } | null): string {
    return String(control?.value ?? '').trim();
  }

  scheduleRedirect(): void {
    this.cancelRedirect();
    this.redirectTimer = setTimeout(() => {
      this.redirectTimer = null;
      void this.router.navigate(['/']);
    }, REDIRECT_DELAY_MS);
  }

  cancelRedirect(): void {
    if (this.redirectTimer === null) {
      return;
    }

    clearTimeout(this.redirectTimer);
    this.redirectTimer = null;
  }

  toMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
