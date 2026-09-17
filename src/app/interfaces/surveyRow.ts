export interface SurveyRow {
  id: number;
  created_at: string;
  name: string | null;
  description: string | null;
  category: string | null;
  end_date: string | null;
}

export interface NewSurvey extends Omit<SurveyRow, 'id' | 'created_at' | 'name' | 'category'> {
  name: string;
  category: string;
}
