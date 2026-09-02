import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyResults } from './survey-results';

describe('SurveyResults', () => {
  let component: SurveyResults;
  let fixture: ComponentFixture<SurveyResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyResults);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questions', []);
    fixture.componentRef.setInput('results', {});
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
