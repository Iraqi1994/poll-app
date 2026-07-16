import { Component, input } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-question',
  imports: [ReactiveFormsModule],
  templateUrl: './question.html',
  styleUrl: './question.scss',
})
export class Question {
  questionGroup = input.required<FormGroup>();
  questionIndex = input<number>(1);

  get answers(): FormArray {
    return this.questionGroup().get('answers') as FormArray;
  }

  get answerControls(): FormControl[] {
    return this.answers.controls as FormControl[];
  }

  getAnswerLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  addAnswer(): void {
    this.answers.push(new FormControl(''));
  }
}
