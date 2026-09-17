export interface QuestionDraft {
  text: string;
  allowMultiple: boolean;
  answers: string[];
}

export interface SurveyDraft {
  name: string;
  description: string;
  category: string;
  endDate: string;
  questions: QuestionDraft[];
}
