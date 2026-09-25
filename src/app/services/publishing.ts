import { Injectable, inject } from '@angular/core';
import { Supabase } from './supabase';
import { SurveyStore } from './survey-store';
import { NewSurvey } from '../interfaces/surveyRow';
import { NewQuestion, QuestionRow } from '../interfaces/questionRow';
import { NewOption } from '../interfaces/optionRow';
import { SurveyDraft } from '../interfaces/surveyDraft';

@Injectable({ providedIn: 'root' })
export class Publishing {
  private readonly db = inject(Supabase);
  private readonly store = inject(SurveyStore);

  /**
   * Writes a draft to Supabase as a survey, its questions and their options, then refreshes
   * the store so the new survey appears without a reload.
   *
   * @returns The id of the inserted survey.
   */
  async publishSurveyAsync(draft: SurveyDraft): Promise<number> {
    const survey = await this.db.insertSurveyAsync(this.toNewSurvey(draft));
    const questions = await this.db.insertQuestionsAsync(this.toNewQuestions(survey.id, draft));
    await this.db.insertOptionsAsync(this.toNewOptions(questions, draft));
    await this.store.refreshSurveysAsync();

    return survey.id;
  }

  /** Maps a draft to a survey row, turning empty optional fields into `null`. */
  toNewSurvey(draft: SurveyDraft): NewSurvey {
    return {
      name: draft.name,
      description: draft.description || null,
      category: draft.category,
      end_date: draft.endDate || null,
    };
  }

  /** Maps the draft's questions to rows for `surveyId`, numbering them from 1. */
  toNewQuestions(surveyId: number, draft: SurveyDraft): NewQuestion[] {
    return draft.questions.map((question, index) => ({
      survey_id: surveyId,
      text: question.text,
      type: question.allowMultiple ? 'multiple' : 'single',
      order: index + 1,
    }));
  }

  /**
   * Maps the draft's answers to option rows, pairing each inserted question with the draft
   * question at the same index.
   */
  toNewOptions(questions: QuestionRow[], draft: SurveyDraft): NewOption[] {
    return questions.flatMap((question, index) =>
      (draft.questions[index]?.answers ?? []).map((answer, answerIndex) => ({
        question_id: question.id,
        text: answer,
        order: answerIndex + 1,
      })),
    );
  }
}
