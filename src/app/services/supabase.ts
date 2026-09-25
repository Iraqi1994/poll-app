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

  /**
   * Reads every survey, newest first.
   *
   * @throws The Supabase error when the request fails.
   */
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

  /**
   * Reads every question across all surveys, in display order.
   *
   * @throws The Supabase error when the request fails.
   */
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

  /**
   * Reads every answer option across all questions, in display order.
   *
   * @throws The Supabase error when the request fails.
   */
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

  /**
   * Reads every vote across all surveys, newest first.
   *
   * @throws The Supabase error when the request fails.
   */
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

  /**
   * Inserts one survey and returns the stored row, including its generated id.
   *
   * @throws The Supabase error when the insert fails.
   */
  async insertSurveyAsync(survey: NewSurvey): Promise<SurveyRow> {
    const { data, error } = await this.client.from('surveys').insert(survey).select().single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Inserts the questions and returns the stored rows in display order, so their generated ids
   * line up with the options that reference them.
   *
   * @throws The Supabase error when the insert fails.
   */
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

  /**
   * Inserts the answer options.
   *
   * @throws The Supabase error when the insert fails.
   */
  async insertOptionsAsync(options: NewOption[]): Promise<void> {
    const { error } = await this.client.from('options').insert(options);

    if (error) {
      throw error;
    }
  }

  /**
   * Inserts the votes, one row per selected answer.
   *
   * @throws The Supabase error when the insert fails.
   */
  async insertVotesAsync(votes: NewVote[]): Promise<void> {
    const { error } = await this.client.from('votes').insert(votes);

    if (error) {
      throw error;
    }
  }

  /**
   * Asks the backend whether `voterId` already voted in `surveyId`, which catches votes cast
   * from another browser.
   *
   * @throws The Supabase error when the request fails.
   */
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

  /**
   * Subscribes to vote changes.
   *
   * @param onChange Called on every insert, update or delete.
   * @param onResync Called once the subscription is live, to catch up on anything missed.
   * @returns A function that removes the channel.
   */
  onVotesChanged(onChange: () => void, onResync: () => void): () => void {
    const channel = this.createVotesChannel(onChange);
    this.subscribeWithResync('votes', channel, onResync);

    return () => void this.client.removeChannel(channel);
  }

  /** Builds the unsubscribed channel that listens for any change to the votes table. */
  createVotesChannel(onChange: () => void): RealtimeChannel {
    return this.client
      .channel('votes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => onChange());
  }

  /**
   * Subscribes to survey changes, including newly added questions and options.
   *
   * @param onChange Called whenever a survey, question or option changes.
   * @param onResync Called once the subscription is live, to catch up on anything missed.
   * @returns A function that removes the channel.
   */
  onSurveysChanged(onChange: () => void, onResync: () => void): () => void {
    const channel = this.createSurveysChannel(onChange);
    this.subscribeWithResync('surveys', channel, onResync);

    return () => void this.client.removeChannel(channel);
  }

  /**
   * Builds the unsubscribed channel covering any survey change plus inserts on questions and
   * options, so a newly published survey arrives complete.
   */
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

  /**
   * Subscribes `channel`, calling `onResync` each time it reaches the subscribed state and
   * logging any other status, so a reconnect refetches rather than silently drifting.
   */
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
