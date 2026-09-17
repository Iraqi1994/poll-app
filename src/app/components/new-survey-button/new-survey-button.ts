import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-new-survey-button',
  imports: [RouterLink],
  templateUrl: './new-survey-button.html',
  styleUrl: './new-survey-button.scss',
})
export class NewSurveyButton {
  label = input.required<string>();
}
