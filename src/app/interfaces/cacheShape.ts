import { OptionRow } from './optionRow';
import { QuestionRow } from './questionRow';
import { SurveyRow } from './surveyRow';
import { VoteRow } from './voteRow';

export interface CacheShape {
  version: 1;
  savedAt: number;
  surveys: SurveyRow[];
  questions: QuestionRow[];
  options: OptionRow[];
  votes: VoteRow[];
}
