import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Atf } from './components/atf/atf';
import { YourSurveys } from './components/your-surveys/your-surveys';
import { ActiveSurveys } from './components/active-surveys/active-surveys';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Atf, YourSurveys, ActiveSurveys],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('poll-app');
}
