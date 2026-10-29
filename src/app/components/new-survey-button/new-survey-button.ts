import { Component, input, signal } from '@angular/core';
import { NewSurveyForm } from '../new-survey-form/new-survey-form';

@Component({
  selector: 'app-new-survey-button',
  imports: [NewSurveyForm],
  templateUrl: './new-survey-button.html',
  styleUrl: './new-survey-button.scss',
})
export class NewSurveyButton {
  label = input.required<string>();

  open = signal(false);
}
