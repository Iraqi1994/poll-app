import { Component } from '@angular/core';
import { Survey } from './survey/survey';

@Component({
  selector: 'app-your-surveys',
  imports: [Survey],
  templateUrl: './your-surveys.html',
  styleUrl: './your-surveys.scss',
})
export class YourSurveys {}
