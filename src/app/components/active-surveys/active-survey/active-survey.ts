import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyRow } from '../../../interfaces/surveyRow';

@Component({
  selector: 'app-active-survey',
  imports: [DatePipe, RouterLink],
  templateUrl: './active-survey.html',
  styleUrl: './active-survey.scss',
})
export class ActiveSurvey {
  readonly survey = input.required<SurveyRow>();
}
