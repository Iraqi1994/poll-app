import { Component } from '@angular/core';
import { YourSurvey } from './survey/survey';

@Component({
  selector: 'app-your-surveys',
  imports: [YourSurvey],
  templateUrl: './your-surveys.html',
  styleUrl: './your-surveys.scss',
})
export class YourSurveys {}
