export interface SurveyAnswer {
  id: string;
  text: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  allowMultiple: boolean;
  answers: SurveyAnswer[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  endsOn: string;
  status: 'draft' | 'published';
  questions: SurveyQuestion[];
}

/** Maps an answer id to its result percentage (0-100). Used by the results panel. */
export type SurveyResults = Record<string, number>;
