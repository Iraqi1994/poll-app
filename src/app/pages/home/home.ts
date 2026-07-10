import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Atf } from '../../components/atf/atf';
import { YourSurveys } from '../../components/your-surveys/your-surveys';
import { ActiveSurveys } from '../../components/active-surveys/active-surveys';

@Component({
  selector: 'app-home',
  imports: [Header, Atf, YourSurveys, ActiveSurveys],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
