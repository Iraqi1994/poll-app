import { Component, input, output } from '@angular/core';
import { SurveyQuestion } from '../../models/survey';

@Component({
  selector: 'app-survey-question-view',
  imports: [],
  templateUrl: './survey-question-view.html',
  styleUrl: './survey-question-view.scss',
})
export class SurveyQuestionView {
  question = input.required<SurveyQuestion>();
  index = input<number>(1);
  selectedIds = input<string[]>([]);
  disabled = input(false);

  answerToggled = output<string>();

  getAnswerLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  isSelected(answerId: string): boolean {
    return this.selectedIds().includes(answerId);
  }
}
