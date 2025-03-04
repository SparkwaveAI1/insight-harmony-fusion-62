export type DataSource = "twitter" | "reddit" | "news" | "all";
export type SentimentFilter = "positive" | "neutral" | "negative" | "all";
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
  sentiment: string;
  source: string;
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
  aiInsights?: string[]; 
  trendsAnalysis?: string;
  reportGeneratedAt?: string;
}

// API configuration keys storage
export const STORAGE_KEYS = {
  NEWS_API_KEY: "persona_news_api_key",
  TWITTER_API_KEY: "persona_twitter_api_key",
  REDDIT_API_KEY: "persona_reddit_api_key"
};

// Default API keys
export const DEFAULT_API_KEYS = {
  newsApi: "1dbe0abf78c24a02a593ce5ba0b1c6fa", // This is a placeholder key
  twitter: "", // For production, this should be managed securely
  reddit: "",
};
