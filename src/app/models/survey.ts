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
  status: 'draft' | 'published' | 'completed';
  questions: SurveyQuestion[];
}

export type SurveyResults = Record<string, number>;

export const SURVEY_CATEGORIES = [
  'All Surveys',
  'Team Activities',
  'Health & Wellness',
  'Gaming & Entertainment',
  'Education & Learning',
  'Lifestyle & Preferences',
  'Technology & Innovation',
] as const;

export type SurveyCategory = (typeof SURVEY_CATEGORIES)[number];
