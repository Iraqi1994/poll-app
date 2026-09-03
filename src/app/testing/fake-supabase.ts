import { Provider } from '@angular/core';

import { OptionRow } from '../interfaces/optionRow';
import { QuestionRow } from '../interfaces/questionRow';
import { SurveyRow } from '../interfaces/surveyRow';
import { VoteRow } from '../interfaces/voteRow';
import { Supabase } from '../services/supabase';

/**
 * In-memory stand-in for {@link Supabase} used by component specs. Tests mutate the public row
 * arrays, then trigger a store refresh; the async getters just echo the current arrays back.
 */
export class FakeSupabase {
  surveys: SurveyRow[] = [];
  questions: QuestionRow[] = [];
  options: OptionRow[] = [];
  votes: VoteRow[] = [];

  async getSurveysAsync(): Promise<SurveyRow[]> {
    return this.surveys;
  }

  async getQuestionsAsync(): Promise<QuestionRow[]> {
    return this.questions;
  }

  async getOptionsAsync(): Promise<OptionRow[]> {
    return this.options;
  }

  async getVotesAsync(): Promise<VoteRow[]> {
    return this.votes;
  }
}

/** Provides {@link FakeSupabase} in place of the real {@link Supabase} client for a TestBed. */
export function provideFakeSupabase(): Provider {
  return { provide: Supabase, useClass: FakeSupabase };
}
