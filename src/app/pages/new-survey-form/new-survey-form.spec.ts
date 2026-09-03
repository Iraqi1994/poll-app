import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewSurveyForm } from './new-survey-form';

describe('NewSurveyForm', () => {
  let component: NewSurveyForm;
  let fixture: ComponentFixture<NewSurveyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSurveyForm],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NewSurveyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

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
});
