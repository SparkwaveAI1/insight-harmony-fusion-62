
export type DataSource = "twitter" | "reddit" | "news" | "forums" | "blogs";
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
}
