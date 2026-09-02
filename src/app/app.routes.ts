import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NewSurveyForm } from './pages/new-survey-form/new-survey-form';
import { SurveyView } from './pages/survey-view/survey-view';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'new-survey', component: NewSurveyForm },
  { path: 'survey/:id', component: SurveyView },
];
