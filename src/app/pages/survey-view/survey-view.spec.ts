import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SurveyView } from './survey-view';
import { FakeSupabase, provideFakeSupabase } from '../../testing/fake-supabase';
import { Supabase } from '../../services/supabase';
import { SurveyStore } from '../../services/survey-store';

describe('SurveyView', () => {
  let component: SurveyView;
  let fixture: ComponentFixture<SurveyView>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SurveyView],
      providers: [provideRouter([]), provideFakeSupabase()],
    }).compileComponents();

    const db = TestBed.inject(Supabase) as unknown as FakeSupabase;
    db.surveys = [
      {
        id: 3,
        created_at: '2026-09-02T14:05:09Z',
        name: 'Favorite Programming Language 2026',
        description: 'Which language do you reach for first?',
        end_date: '2026-12-31',
      },
    ];
    db.questions = [
      {
        id: 3,
        created_at: '2026-09-02T14:05:09Z',
        survey_id: 3,
        text: 'Your primary language',
        type: 'single',
        order: 1,
      },
      {
        id: 4,
        created_at: '2026-09-02T14:05:09Z',
        survey_id: 3,
        text: 'Which do you want to learn?',
        type: 'multiple',
        order: 2,
      },
      {
        id: 9,
        created_at: '2026-09-02T14:05:09Z',
        survey_id: 4,
        text: 'A question of another survey',
        type: 'single',
        order: 1,
      },
    ];
    db.options = [
      { id: 1, created_at: '', question_id: 3, text: 'TypeScript', order: 1, vote_count: 0 },
      { id: 2, created_at: '', question_id: 3, text: 'Rust', order: 2, vote_count: 0 },
      { id: 3, created_at: '', question_id: 4, text: 'Go', order: 1, vote_count: 0 },
      { id: 4, created_at: '', question_id: 9, text: 'Belongs elsewhere', order: 1, vote_count: 0 },
    ];
    // The store loads on construction, so seed the fake before injecting it.
    await TestBed.inject(SurveyStore).refresh();

    fixture = TestBed.createComponent(SurveyView);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '3');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the survey from the store keyed by the route id', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Favorite Programming Language 2026');
    expect(text).toContain('Which language do you reach for first?');
    expect(text).not.toContain('Survey not found.');
  });

  it('nests only its own questions, each with its own options', () => {
    const survey = component.survey();
    expect(survey?.questions.map((q) => q.text)).toEqual([
      'Your primary language',
      'Which do you want to learn?',
    ]);
    expect(survey?.questions[0]?.answers.map((a) => a.text)).toEqual(['TypeScript', 'Rust']);
    expect(survey?.questions[0]?.allowMultiple).toBe(false);
    expect(survey?.questions[1]?.allowMultiple).toBe(true);
  });

  it('reports a missing survey instead of rendering an empty card', async () => {
    fixture.componentRef.setInput('id', '999');
    await fixture.whenStable();

    expect(component.survey()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Survey not found.');
  });
});
