
export type DataSource = "twitter" | "reddit" | "news" | "forums" | "blogs" | "all";
export type SentimentFilter = "positive" | "negative" | "neutral" | "all";
export type TimeFrame = "real-time" | "short-term" | "medium-term" | "long-term" | "historical" | "deep-historical";

export interface ResearchQuery {
  query: string;
  sources: DataSource[];
  sentiment: SentimentFilter;
  timeFrame: TimeFrame;
  keywords: string[];
}

export interface Quote {
  text: string;
  source: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
}

// Added this new type for QuoteData that various services are using
export interface QuoteData {
  text: string;
  source: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface TimelineEvent {
  id: string;
  date: string;
  timestamp: string;
  position: string;
  label: string;
  description: string;
  sentiment: "positive" | "neutral" | "negative";
  impact: number;
  quotes?: Quote[];
}

export interface TopicRippleData {
  name: string;
  [topic: string]: number | string;
}

export interface TopicInsight {
  topic: string;
  description: string;
  trend: "rising" | "falling" | "stable";
  sentiment: "positive" | "negative" | "neutral";
}

// Adding missing properties needed by InsightsGenerator
export interface AnalysisResults {
  aiSummary: string;
  reportGeneratedAt: string;
  keyInsights: string[];
  challenges: string[];
  recommendations: string[];
  timelineEvents: TimelineEvent[];
  topicRippleData: TopicRippleData[];
  topicInsights: TopicInsight[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sourceBreakdown: {
    [key in DataSource]?: number;
  };
  
  // Additional properties needed by InsightsGenerator
  aiInsights?: string[];
  topTopics?: string[];
  exampleQuotes?: QuoteData[];
  trendsAnalysis?: string[];
}

// Adding constants needed by apiKeyUtils
export const STORAGE_KEYS = {
  API_KEYS: "persona_api_keys",
  USER_PREFERENCES: "persona_user_preferences"
};

export const DEFAULT_API_KEYS = {
  OPENAI: "",
  TWITTER: "",
  NEWS_API: ""
};
