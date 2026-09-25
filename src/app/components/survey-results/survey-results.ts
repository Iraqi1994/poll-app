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

  /** Returns the display letter for an answer at `index`, so 0 becomes `A`. */
  getAnswerLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /** Returns the share of the vote for `answerId`, or 0 when it has no result yet. */
  percentFor(answerId: string): number {
    return this.results()[answerId] ?? 0;
  }
}
