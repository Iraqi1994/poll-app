import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NewSurveyForm } from './pages/new-survey-form/new-survey-form';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'new-survey', component: NewSurveyForm },
];
