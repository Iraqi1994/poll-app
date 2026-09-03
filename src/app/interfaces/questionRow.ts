export interface QuestionRow {
  id: number;
  created_at: string;
  survey_id: number | null;
  text: string | null;
  type: string | null;
  order: number | null;
}
