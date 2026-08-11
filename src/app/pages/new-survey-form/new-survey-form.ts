import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Question } from '../../components/question/question';

@Component({
  selector: 'app-new-survey-form',
  imports: [ReactiveFormsModule, RouterLink, Question],
  templateUrl: './new-survey-form.html',
  styleUrl: './new-survey-form.scss',
})
export class NewSurveyForm {
  surveyForm = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.minLength(3)] }),
    description: new FormControl('', { validators: [Validators.maxLength(200)] }),
    endDate: new FormControl(''),
    questions: new FormArray([this.createQuestion(true)]),
  });

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  get questionGroups(): FormGroup[] {
    return this.questions.controls as FormGroup[];
  }

  private createQuestion(required: boolean): FormGroup {
    return new FormGroup({
      text: new FormControl(
        '',
        required ? [Validators.required, Validators.maxLength(150)] : [Validators.maxLength(150)],
      ),
      allowMultiple: new FormControl(false),
      answers: new FormArray([new FormControl(''), new FormControl('')]),
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion(false));
  }

  onPublish(): void {
    // TODO: implement survey submission
  }
}
