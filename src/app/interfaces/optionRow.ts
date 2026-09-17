export interface OptionRow {
  id: number;
  created_at: string;
  question_id: number | null;
  text: string | null;
  order: number | null;
  vote_count: number;
}

export interface NewOption {
  question_id: number;
  text: string;
  order: number;
}
