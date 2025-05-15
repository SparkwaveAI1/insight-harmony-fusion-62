
export interface InterviewQuestion {
  question: string;
  response?: string;
}

export interface InterviewSection {
  section: string;
  notes: string;
  questions: (string | InterviewQuestion)[];
  responses?: string[];
}
