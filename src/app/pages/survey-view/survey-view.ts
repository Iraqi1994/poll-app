import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Survey, SurveyResults as SurveyResultsMap } from '../../models/survey';
import { SurveyQuestionView } from '../../components/survey-question-view/survey-question-view';
import { SurveyResults } from '../../components/survey-results/survey-results';

@Component({
  selector: 'app-survey-view',
  imports: [RouterLink, SurveyQuestionView, SurveyResults],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {
  // Route param `survey/:id`. Not used to look anything up yet — the survey below is a placeholder.
  id = input<string>();

  survey: Survey = {
    id: '1',
    title: "Let's Plan the Next Team Event Together",
    description:
      'We want to create team activities that everyone will enjoy – share your preferences and ideas in our survey to help us plan better experiences together.',
    category: 'Team activities',
    endsOn: '01.09.2025',
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'Which date would work best for you?',
        allowMultiple: true,
        answers: [
          { id: 'q1a', text: '19.09.2025, Friday' },
          { id: 'q1b', text: '10.10.2025, Friday' },
          { id: 'q1c', text: '11.10.2025, Saturday' },
          { id: 'q1d', text: '31.10.2025, Friday' },
        ],
      },
      {
        id: 'q2',
        text: 'Choose the activities you prefer',
        allowMultiple: true,
        answers: [
          { id: 'q2a', text: 'Outdoor adventure like kayaking' },
          { id: 'q2b', text: 'Office Costume Party' },
          { id: 'q2c', text: 'Bowling, mini-golf, volleyball' },
          { id: 'q2d', text: 'Beach party, Music & cocktails' },
          { id: 'q2e', text: 'Escape room' },
        ],
      },
      {
        id: 'q3',
        text: "What's most important to you in a team event?",
        allowMultiple: false,
        answers: [
          { id: 'q3a', text: 'Team bonding' },
          { id: 'q3b', text: 'Food and drinks' },
          { id: 'q3c', text: 'Trying something new' },
          { id: 'q3d', text: 'Keeping it low-key and stress-free' },
        ],
      },
      {
        id: 'q4',
        text: 'How long would you prefer the event to last?',
        allowMultiple: false,
        answers: [
          { id: 'q4a', text: 'Half a day' },
          { id: 'q4b', text: 'Full day' },
          { id: 'q4c', text: 'Evening only' },
        ],
      },
    ],
  };

  results: SurveyResultsMap = {
    q1a: 27,
    q1b: 44,
    q1c: 3,
    q1d: 26,
    q2a: 60,
    q2b: 0,
    q2c: 14,
    q2d: 26,
    q2e: 0,
    q3a: 44,
    q3b: 3,
    q3c: 26,
    q3d: 27,
    q4a: 14,
    q4b: 86,
    q4c: 0,
  };
}
