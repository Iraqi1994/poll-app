import { Component, input } from '@angular/core';
import { SurveyQuestion, SurveyResults as SurveyResultsMap } from '../../models/survey';

@Component({
  selector: 'app-survey-results',
  imports: [],
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss',
})
export class SurveyResults {
  questions = input.required<SurveyQuestion[]>();
  results = input.required<SurveyResultsMap>();

  getAnswerLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  percentFor(answerId: string): number {
    return this.results()[answerId] ?? 0;
  }
}
