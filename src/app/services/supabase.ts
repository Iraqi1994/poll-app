import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SurveyRow } from '../interfaces/surveyRow';
import { QuestionRow } from '../interfaces/questionRow';
import { OptionRow } from '../interfaces/optionRow';
import { VoteRow } from '../interfaces/voteRow';

const SUPABASE_URL = 'https://epaxyugtxwvxvyqsinho.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2I3zgxrFS431KFoytAJ9cA_UZjo8lSU';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  readonly client: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

  async getSurveysAsync(): Promise<SurveyRow[]> {
    const { data, error } = await this.client
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async getQuestionsAsync(): Promise<QuestionRow[]> {
    const { data, error } = await this.client
      .from('questions')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async getOptionsAsync(): Promise<OptionRow[]> {
    const { data, error } = await this.client
      .from('options')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async getVotesAsync(): Promise<VoteRow[]> {
    const { data, error } = await this.client
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  }
}
