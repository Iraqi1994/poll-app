import { Component } from '@angular/core';
import { ActiveSurvey } from './survey/survey';

@Component({
  selector: 'app-active-surveys',
  imports: [ActiveSurvey],
  templateUrl: './active-surveys.html',
  styleUrl: './active-surveys.scss',
})
export class ActiveSurveys {}
