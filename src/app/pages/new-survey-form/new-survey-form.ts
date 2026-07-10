import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-survey-form',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './new-survey-form.html',
  styleUrl: './new-survey-form.scss',
})
export class NewSurveyForm {
  surveyForm = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.minLength(3)] }),
    description: new FormControl('', { validators: [Validators.maxLength(200)] }),
    endDate: new FormControl(''),
  });
}
