import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewSurveyButton } from './new-survey-button';

describe('NewSurveyButton', () => {
  let component: NewSurveyButton;
  let fixture: ComponentFixture<NewSurveyButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSurveyButton],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NewSurveyButton);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'New survey');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the label text', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('New survey');
  });
});
