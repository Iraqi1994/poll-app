export interface SurveyRow {
  id: number;
  created_at: string;
  name: string | null;
  description: string | null;
  category: string | null;
  end_date: string | null;
}
