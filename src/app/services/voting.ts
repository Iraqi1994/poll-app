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
  db = inject(Supabase);
  store = inject(SurveyStore);
  voter = inject(Voter);
  storage = inject(LocalStore);

  _votedSurveyIds = signal<number[]>(this.loadVotedIds());

  votedSurveyIds = this._votedSurveyIds.asReadonly();

  /** Whether this browser has already voted in `surveyId`, according to local state only. */
  hasVoted(surveyId: number): boolean {
    return this._votedSurveyIds().includes(surveyId);
  }

  /** Inserts the selected answers as votes, marks the survey voted, and refreshes the tallies. */
  async castVotesAsync(surveyId: number, selections: SelectedAnswer[]): Promise<void> {
    await this.db.insertVotesAsync(this.toNewVotes(surveyId, selections));
    this.markVoted(surveyId);
    await this.store.refreshVotesAsync();
  }

  /**
   * Reconciles local state with the backend, so a vote cast on another device still counts as
   * voted here. Does nothing when this browser already knows it voted.
   */
  async syncVotedAsync(surveyId: number): Promise<void> {
    if (this.hasVoted(surveyId)) {
      return;
    }

    if (await this.db.hasVotedAsync(surveyId, this.voter.id)) {
      this.markVoted(surveyId);
    }
  }

  /** Maps the selected answers to vote rows stamped with this browser's voter id. */
  toNewVotes(surveyId: number, selections: SelectedAnswer[]): NewVote[] {
    return selections.map((selection) => ({
      voter_id: this.voter.id,
      survey_id: surveyId,
      question_id: selection.questionId,
      option_id: selection.optionId,
    }));
  }

  /** Records `surveyId` as voted and persists the list, ignoring ids already recorded. */
  markVoted(surveyId: number): void {
    if (this.hasVoted(surveyId)) {
      return;
    }

    this._votedSurveyIds.update((ids) => [...ids, surveyId]);
    this.storage.set(VOTED_KEY, this._votedSurveyIds());
  }

  /** Reads the persisted voted-survey ids, falling back to an empty list. */
  loadVotedIds(): number[] {
    return this.storage.get<number[]>(VOTED_KEY) ?? [];
  }
}
