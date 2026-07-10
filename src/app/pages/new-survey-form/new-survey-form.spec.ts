import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSurveyForm } from './new-survey-form';

describe('NewSurveyForm', () => {
  let component: NewSurveyForm;
  let fixture: ComponentFixture<NewSurveyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSurveyForm],
    }).compileComponents();

    fixture = TestBed.createComponent(NewSurveyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
