import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategorySelect } from '../category-select/category-select';
import { DeleteButton } from '../delete-button/delete-button';
import { Question } from '../question/question';
import { QuestionDraft } from '../../interfaces/surveyDraft';
import { SurveyDraft } from '../../interfaces/surveyDraft';
import { SurveyCategory } from '../../models/survey';
import { Publishing } from '../../services/publishing';

const CLOSE_DELAY_MS = 2000;

@Component({
  selector: 'app-new-survey-form',
  imports: [ReactiveFormsModule, Question, DeleteButton, CategorySelect],
  templateUrl: './new-survey-form.html',
  styleUrl: './new-survey-form.scss',
})
export class NewSurveyForm implements OnDestroy {
  publishing = inject(Publishing);

  closed = output<void>();

  dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  closeTimer: ReturnType<typeof setTimeout> | null = null;

  pressStartedOutside = false;

  today: string = new Date().toISOString().split('T')[0];

  submitting = signal(false);
  published = signal(false);
  publishError = signal<string | null>(null);

  publishLabel = computed(() => (this.submitting() ? 'Publishing…' : 'Publish'));

  surveyForm = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(80)],
    }),
    description: new FormControl('', { validators: [Validators.maxLength(250)] }),
    endDate: new FormControl(''),
    category: new FormControl<SurveyCategory | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    questions: new FormArray([this.createQuestion()]),
  });

  /** Opens the dialog as a modal once it is in the DOM, so the page behind becomes inert. */
  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  /** Clears the pending close so it cannot fire after the form is gone. */
  ngOnDestroy(): void {
    this.cancelClose();
  }

  /** The survey name control, used by the template for its validation message. */
  get name() {
    return this.surveyForm.get('name') as FormControl;
  }

  /** Current length of the survey name, for the character counter. */
  get nameLength(): number {
    return this.name.value?.length ?? 0;
  }

  /** The validation message for the survey name, naming the rule it currently breaks. */
  get nameErrorMessage(): string {
    return this.name.hasError('required')
      ? 'Survey name is required.'
      : 'Survey name needs at least 3 characters.';
  }

  /** The array holding one group per question. */
  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  /** The question groups, typed for the `Question` child's required input. */
  get questionGroups(): FormGroup[] {
    return this.questions.controls as FormGroup[];
  }

  /** Current length of the description text, for the character counter. */
  get descriptionLength(): number {
    return this.surveyForm.get('description')?.value?.length ?? 0;
  }

  /** Builds one question group, pre-filled with the two required answer controls. */
  createQuestion(): FormGroup {
    return new FormGroup({
      text: new FormControl('', [Validators.required, Validators.maxLength(150)]),
      allowMultiple: new FormControl(false),
      answers: new FormArray([
        new FormControl('', { validators: [Validators.required, Validators.maxLength(50)] }),
        new FormControl('', { validators: [Validators.required, Validators.maxLength(50)] }),
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
   * Publishes the draft, then shows the confirmation and schedules the dialog to close. A failure
   * is reported through {@link publishError} rather than thrown.
   */
  async savePublishAsync(): Promise<void> {
    try {
      await this.publishing.publishSurveyAsync(this.toDraft());
      this.published.set(true);
      this.scheduleClose();
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

  /** Starts the delayed close of the dialog, replacing any close already pending. */
  scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = setTimeout(() => {
      this.closeTimer = null;
      this.closed.emit();
    }, CLOSE_DELAY_MS);
  }

  /** Drops a pending close. */
  cancelClose(): void {
    if (this.closeTimer === null) {
      return;
    }

    clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }

  /** Reduces a thrown value to a message suitable for {@link publishError}. */
  toMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /** Opens the native date picker of the clicked date input, not only via its calendar icon. */
  openDatePicker(event: Event): void {
    (event.target as HTMLInputElement).showPicker();
  }

  /** Remembers whether the press began on the backdrop, for {@link onDialogClick}. */
  onDialogMouseDown(event: MouseEvent): void {
    this.pressStartedOutside = this.isOutsideDialog(event);
  }

  /**
   * Closes the dialog on a backdrop click. Both press and release must be outside, so dragging a
   * text selection out of an input does not discard the form.
   */
  onDialogClick(event: MouseEvent): void {
    if (this.pressStartedOutside && this.isOutsideDialog(event)) {
      this.closed.emit();
    }
  }

  /** Whether the pointer position of `event` lies outside the dialog's box, on the backdrop. */
  isOutsideDialog(event: MouseEvent): boolean {
    const rect = this.dialog().nativeElement.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  }
}
