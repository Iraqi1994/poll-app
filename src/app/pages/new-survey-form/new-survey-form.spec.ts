import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { SurveyDraft } from '../../interfaces/surveyDraft';
import { Publishing } from '../../services/publishing';
import { NewSurveyForm } from './new-survey-form';

describe('NewSurveyForm', () => {
  let component: NewSurveyForm;
  let fixture: ComponentFixture<NewSurveyForm>;
  let published: SurveyDraft[];

  beforeEach(async () => {
    published = [];

    await TestBed.configureTestingModule({
      imports: [NewSurveyForm],
      providers: [
        provideRouter([]),
        {
          provide: Publishing,
          useValue: {
            publishSurveyAsync: (draft: SurveyDraft) => {
              published.push(draft);
              return Promise.resolve(1);
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewSurveyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function fillValidSurvey(): void {
    component.surveyForm.get('name')?.setValue('My survey');
    component.surveyForm.get('category')?.setValue('Team Activities');

    const question = component.questionGroups[0];
    question.get('text')?.setValue('Favourite colour?');
    question.get('answers')?.get('0')?.setValue('Red');
    question.get('answers')?.get('1')?.setValue('Blue');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with an empty, required category control', () => {
    const category = component.surveyForm.get('category');
    expect(category).not.toBeNull();
    expect(category?.value).toBe('');
    expect(category?.hasError('required')).toBe(true);
  });

  it('round-trips the picked category through the form value', () => {
    component.surveyForm.get('category')?.setValue('Team Activities');
    expect(component.surveyForm.value.category).toBe('Team Activities');
  });

  it('clears a meta field via clearField', () => {
    component.surveyForm.get('name')?.setValue('My survey');
    component.clearField('name');
    expect(component.surveyForm.get('name')?.value).toBe('');
  });

  it('keeps at least one question when removing', () => {
    component.removeQuestion(0);
    expect(component.questions.length).toBe(1);

    component.addQuestion();
    component.removeQuestion(1);
    expect(component.questions.length).toBe(1);
  });

  it('renders the category dropdown', () => {
    expect(fixture.nativeElement.querySelector('app-category-select')).not.toBeNull();
  });

  it('never removes the first question, even with multiple questions present', () => {
    component.addQuestion();
    component.addQuestion();

    component.removeQuestion(0);

    expect(component.questions.length).toBe(3);
  });

  it('removes the clicked question and renumbers the rest', async () => {
    const addButton: HTMLButtonElement = fixture.nativeElement.querySelector('.add-question-btn');
    addButton.click();
    addButton.click();
    addButton.click();
    await fixture.whenStable();

    const questionInputs = (): HTMLInputElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('app-question .question-input'));

    questionInputs().forEach((input, index) => {
      input.value = `Q${index + 1}`;
      input.dispatchEvent(new Event('input'));
    });
    await fixture.whenStable();

    const deleteButtons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll(
        'app-question .question-header app-delete-button button',
      ),
    );
    deleteButtons[1].click();
    await fixture.whenStable();

    expect(questionInputs().map((input) => input.value)).toEqual(['Q1', 'Q3', 'Q4']);

    const labels: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-question .question-label'),
    );
    expect(labels.map((label) => label.textContent?.trim())).toEqual([
      '1. Question',
      '2. Question',
      '3. Question',
    ]);
  });

  it('requires the text and both answers of an added question', () => {
    component.addQuestion();
    const added = component.questionGroups[1];

    expect(added.get('text')?.hasError('required')).toBe(true);
    expect(added.get('answers')?.get('0')?.hasError('required')).toBe(true);
    expect(added.get('answers')?.get('1')?.hasError('required')).toBe(true);
  });

  it('publishes nothing and marks the form touched when it is invalid', async () => {
    await component.onPublishAsync();

    expect(published).toEqual([]);
    expect(component.surveyForm.get('name')?.touched).toBe(true);
    expect(component.questionGroups[0].get('text')?.touched).toBe(true);
    expect(component.published()).toBe(false);
  });

  it('publishes a draft once the form is valid', async () => {
    fillValidSurvey();

    await component.onPublishAsync();

    expect(published.length).toBe(1);
    expect(published[0].name).toBe('My survey');
    expect(published[0].category).toBe('Team Activities');
    expect(published[0].questions[0].answers).toEqual(['Red', 'Blue']);
    expect(component.published()).toBe(true);
  });

  it('maps blank optional meta fields to empty strings in the draft', () => {
    fillValidSurvey();

    const draft = component.toDraft();

    expect(draft.description).toBe('');
    expect(draft.endDate).toBe('');
  });

  function addAnswerViaUi(): void {
    const addButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'app-question .add-answer-btn',
    );
    addButton.click();
  }

  it('blocks publish when an added answer is left blank', async () => {
    fillValidSurvey();
    addAnswerViaUi();
    await fixture.whenStable();

    await component.onPublishAsync();

    expect(published).toEqual([]);
    const answers = component.questionGroups[0].get('answers') as FormArray;
    expect(answers.at(2)?.touched).toBe(true);
  });

  it('publishes an added answer once it is filled in', async () => {
    fillValidSurvey();
    addAnswerViaUi();
    const answers = component.questionGroups[0].get('answers') as FormArray;
    answers.at(2)?.setValue('Green');
    await fixture.whenStable();

    await component.onPublishAsync();

    expect(published[0].questions[0].answers).toEqual(['Red', 'Blue', 'Green']);
  });
});
