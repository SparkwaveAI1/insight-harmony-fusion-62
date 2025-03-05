
export type DataSource = "twitter" | "reddit" | "news" | "all";
export type SentimentFilter = "positive" | "negative" | "neutral" | "all";
export type TimeFrame = "real-time" | "short-term" | "medium-term" | "long-term" | "historical" | "deep-historical";

export interface ResearchQuery {
  query: string;
  sources: DataSource[];
  sentiment: SentimentFilter;
  timeFrame: TimeFrame;
  keywords: string[];
}

export interface QuoteData {
  text: string;
  sentiment: SentimentFilter;
  source: string;
}

export interface NewsHeadline {
  title: string;
  source: string;
  date: string;
  sentiment: SentimentFilter;
}

export interface PersonaAnalysis {
  persona: string;
  analysis: string;
  sentiment: SentimentFilter;
}

export interface AnalysisResults {
  topTopics: string[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  exampleQuotes: QuoteData[];
  keyPhrases: string[];
  aiInsights: string[];
  trendsAnalysis: string[];
  reportGeneratedAt: string;
  
  // New fields for AI tokens analysis
  newsHeadlines?: NewsHeadline[];
  personaAnalysis?: PersonaAnalysis[];
  actionableInsights?: string[];
  relatedTopics?: string[];
}
