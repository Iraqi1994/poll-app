import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyRow } from '../../../interfaces/surveyRow';

@Component({
  selector: 'app-your-survey',
  imports: [RouterLink, DatePipe],
  templateUrl: './survey.html',
  styleUrl: './survey.scss',
})
export class YourSurvey {
  readonly survey = input.required<SurveyRow>();
}
