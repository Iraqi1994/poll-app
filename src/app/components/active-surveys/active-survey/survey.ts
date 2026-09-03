import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { SurveyRow } from '../../../interfaces/surveyRow';

@Component({
  selector: 'app-active-survey',
  imports: [DatePipe],
  templateUrl: './survey.html',
  styleUrl: './survey.scss',
})
export class ActiveSurvey {
  readonly survey = input.required<SurveyRow>();
}
