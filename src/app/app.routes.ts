import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { SurveyView } from './pages/survey-view/survey-view';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'survey/:id', component: SurveyView },
  { path: '**', redirectTo: '' },
];
