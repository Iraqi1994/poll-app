export interface VoteRow {
  id: number;
  created_at: string;
  voter_id: string;
  survey_id: number;
  question_id: number;
  option_id: number;
}
