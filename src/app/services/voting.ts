import { Injectable, inject, signal } from '@angular/core';
import { Supabase } from './supabase';
import { SurveyStore } from './survey-store';
import { Voter } from './voter';
import { LocalStore } from './local-store';
import { NewVote } from '../interfaces/voteRow';
import { SelectedAnswer } from '../interfaces/selectedAnswer';

const VOTED_KEY = 'voted-surveys/v1';

@Injectable({ providedIn: 'root' })
export class Voting {
  private readonly db = inject(Supabase);
  private readonly store = inject(SurveyStore);
  private readonly voter = inject(Voter);
  private readonly storage = inject(LocalStore);

  private readonly _votedSurveyIds = signal<number[]>(this.loadVotedIds());

  readonly votedSurveyIds = this._votedSurveyIds.asReadonly();

  hasVoted(surveyId: number): boolean {
    return this._votedSurveyIds().includes(surveyId);
  }

  async castVotesAsync(surveyId: number, selections: SelectedAnswer[]): Promise<void> {
    await this.db.insertVotesAsync(this.toNewVotes(surveyId, selections));
    this.markVoted(surveyId);
    await this.store.refreshVotesAsync();
  }

  async syncVotedAsync(surveyId: number): Promise<void> {
    if (this.hasVoted(surveyId)) {
      return;
    }

    if (await this.db.hasVotedAsync(surveyId, this.voter.id)) {
      this.markVoted(surveyId);
    }
  }

  toNewVotes(surveyId: number, selections: SelectedAnswer[]): NewVote[] {
    return selections.map((selection) => ({
      voter_id: this.voter.id,
      survey_id: surveyId,
      question_id: selection.questionId,
      option_id: selection.optionId,
    }));
  }

  markVoted(surveyId: number): void {
    if (this.hasVoted(surveyId)) {
      return;
    }

    this._votedSurveyIds.update((ids) => [...ids, surveyId]);
    this.storage.set(VOTED_KEY, this._votedSurveyIds());
  }

  loadVotedIds(): number[] {
    return this.storage.get<number[]>(VOTED_KEY) ?? [];
  }
}
