import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyQuestionView } from './survey-question-view';

describe('SurveyQuestionView', () => {
  let component: SurveyQuestionView;
  let fixture: ComponentFixture<SurveyQuestionView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyQuestionView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyQuestionView);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', {
      id: 'q1',
      text: 'Sample question?',
      allowMultiple: true,
      answers: [{ id: 'a1', text: 'Option one' }],
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
