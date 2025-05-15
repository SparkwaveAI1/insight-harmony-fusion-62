
export interface InterviewQuestion {
  question: string;
  response?: string;
}

export interface InterviewSection {
  section: string;
  notes: string;
  questions: InterviewQuestion[];
  responses?: string[]; // Keeping for backward compatibility
}
