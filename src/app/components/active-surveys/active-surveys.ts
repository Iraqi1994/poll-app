import { Component } from '@angular/core';
import { Survey } from './survey/survey';

@Component({
  selector: 'app-active-surveys',
  imports: [Survey],
  templateUrl: './active-surveys.html',
  styleUrl: './active-surveys.scss',
})
export class ActiveSurveys {}
