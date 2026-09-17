import { Injectable } from '@angular/core';
import {
  createClient,
  RealtimeChannel,
  REALTIME_SUBSCRIBE_STATES,
  SupabaseClient,
} from '@supabase/supabase-js';
import { SurveyRow, NewSurvey } from '../interfaces/surveyRow';
import { QuestionRow, NewQuestion } from '../interfaces/questionRow';
import { OptionRow, NewOption } from '../interfaces/optionRow';
import { VoteRow, NewVote } from '../interfaces/voteRow';

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

  async insertSurveyAsync(survey: NewSurvey): Promise<SurveyRow> {
    const { data, error } = await this.client.from('surveys').insert(survey).select().single();

    if (error) {
      throw error;
    }

    return data;
  }

  async insertQuestionsAsync(questions: NewQuestion[]): Promise<QuestionRow[]> {
    const { data, error } = await this.client
      .from('questions')
      .insert(questions)
      .select()
      .order('order', { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async insertOptionsAsync(options: NewOption[]): Promise<void> {
    const { error } = await this.client.from('options').insert(options);

    if (error) {
      throw error;
    }
  }

  async insertVotesAsync(votes: NewVote[]): Promise<void> {
    const { error } = await this.client.from('votes').insert(votes);

    if (error) {
      throw error;
    }
  }

  async hasVotedAsync(surveyId: number, voterId: string): Promise<boolean> {
    const { data, error } = await this.client.rpc('has_voted', {
      p_survey_id: surveyId,
      p_voter_id: voterId,
    });

    if (error) {
      throw error;
    }

    return data === true;
  }

  onVotesChanged(onChange: () => void, onResync: () => void): () => void {
    const channel = this.createVotesChannel(onChange);
    this.subscribeWithResync('votes', channel, onResync);

    return () => void this.client.removeChannel(channel);
  }

  createVotesChannel(onChange: () => void): RealtimeChannel {
    return this.client
      .channel('votes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => onChange());
  }

  onSurveysChanged(onChange: () => void, onResync: () => void): () => void {
    const channel = this.createSurveysChannel(onChange);
    this.subscribeWithResync('surveys', channel, onResync);

    return () => void this.client.removeChannel(channel);
  }

  createSurveysChannel(onChange: () => void): RealtimeChannel {
    return this.client
      .channel('surveys-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surveys' }, () => onChange())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'questions' }, () =>
        onChange(),
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'options' }, () =>
        onChange(),
      );
  }

  subscribeWithResync(name: string, channel: RealtimeChannel, onResync: () => void): void {
    channel.subscribe((status, error) => {
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        onResync();
        return;
      }

      console.warn(`${name} channel: ${status}`, error);
    });
  }
}
