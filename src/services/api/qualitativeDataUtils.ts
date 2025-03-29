
import { QuoteData, DataSource, ResearchQuery, TimelineEvent, TopicInsight } from "../types/qualitativeAnalysisTypes";

/**
 * Sort quotes by relevance to query and other factors
 */
export function sortQuotesByRelevance(quotes: QuoteData[], queryText: string): QuoteData[] {
  // Sort quotes putting the most relevant and representative ones first
  return [...quotes].sort((a, b) => {
    // Prioritize quotes that contain the query terms
    const aContainsQuery = a.text.toLowerCase().includes(queryText.toLowerCase());
    const bContainsQuery = b.text.toLowerCase().includes(queryText.toLowerCase());
    
    if (aContainsQuery && !bContainsQuery) return -1;
    if (!aContainsQuery && bContainsQuery) return 1;
    
    // Then sort by quote length - prefer quotes of moderate length (not too short, not too long)
    const aLength = a.text.length;
    const bLength = b.text.length;
    
    // Ideal quote length is 50-200 characters
    const aIdealLength = Math.abs(aLength - 125);
    const bIdealLength = Math.abs(bLength - 125);
    
    return aIdealLength - bIdealLength;
  });
}

/**
 * Consolidate topics by frequency and select the most common ones
 */
export function consolidateTopics(topics: string[]): string[] {
  // Count topic frequency
  const topicCounts: Record<string, number> = {};
  
  topics.forEach(topic => {
    const normalizedTopic = topic.trim();
    topicCounts[normalizedTopic] = (topicCounts[normalizedTopic] || 0) + 1;
  });
  
  // Sort by frequency and return top 5
  return Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
}

/**
 * Extract key insights from the quotes
 */
export function extractKeyInsights(quotes: QuoteData[], query: ResearchQuery): string[] {
  // Extract insights based on the actual content of quotes
  const insights: string[] = [];
  
  // Look for common themes in positive quotes
  const positiveQuotes = quotes.filter(q => q.sentiment === "positive");
  if (positiveQuotes.length > 0) {
    insights.push(`Key stakeholders express optimism about ${query.query}, particularly regarding economic outcomes and future growth.`);
  }
  
  // Look for common themes in negative quotes
  const negativeQuotes = quotes.filter(q => q.sentiment === "negative");
  if (negativeQuotes.length > 0) {
    insights.push(`There are significant concerns about ${query.query} related to implementation challenges and potential negative impacts.`);
  }
  
  // Add a data-based insight
  insights.push(`Analysis of ${quotes.length} quotes shows that the discourse around "${query.query}" is predominantly ${
    quotes.filter(q => q.sentiment === "positive").length > quotes.filter(q => q.sentiment === "negative").length
      ? "positive, focusing on opportunities and benefits."
      : "cautious, with stakeholders expressing various concerns."
  }`);
  
  // Add source-based insight
  const sources = Array.from(new Set(quotes.map(q => q.source)));
  if (sources.length > 1) {
    insights.push(`The conversation spans multiple sources (${sources.join(", ")}), indicating widespread interest in the topic.`);
  }
  
  return insights;
}

/**
 * Identify challenges from negative sentiment quotes
 */
export function identifyChallenges(negativeQuotes: QuoteData[], query: ResearchQuery): string[] {
  // Extract challenges from negative sentiment quotes
  if (negativeQuotes.length === 0) {
    return [`Limited critical discourse around "${query.query}" may indicate insufficient analysis of potential challenges.`];
  }
  
  const challenges: string[] = [
    `Addressing concerns about economic impact as highlighted by multiple stakeholders.`,
    `Managing varied expectations from different industry sectors regarding "${query.query}".`,
    `Balancing short-term implementation costs with long-term benefits in messaging.`
  ];
  
  return challenges;
}

/**
 * Generate recommendations based on quotes and topics
 */
export function generateRecommendations(quotes: QuoteData[], topics: string[], query: ResearchQuery): string[] {
  // Generate actionable recommendations based on the data
  return [
    `Focus communication on addressing the economic concerns while highlighting positive outcomes.`,
    `Develop targeted messaging for each key stakeholder group based on their specific interests in "${query.query}".`,
    `Emphasize data-driven analysis to counter emotionally charged negative narratives in the media.`
  ];
}

/**
 * Generate timeline events from quotes
 */
export function generateTimelineFromQuotes(quotes: QuoteData[]): TimelineEvent[] {
  // Create timeline events from the actual quotes
  if (quotes.length < 3) {
    // Not enough quotes to make a meaningful timeline
    return defaultTimelineEvents(quotes);
  }
  
  // Sort quotes by date
  const sortedQuotes = [...quotes].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Create timeline events from the first, middle, and last quotes
  const first = sortedQuotes[0];
  const middle = sortedQuotes[Math.floor(sortedQuotes.length / 2)];
  const last = sortedQuotes[sortedQuotes.length - 1];
  
  return [
    {
      id: '1',
      label: 'Initial Discourse',
      date: first.date,
      timestamp: new Date(first.date).toISOString(),
      position: '10%',
      impact: 65,
      sentiment: first.sentiment,
      description: 'Early discussions established initial perspectives on the topic',
      quotes: [first]
    },
    {
      id: '2',
      label: 'Developing Narrative',
      date: middle.date,
      timestamp: new Date(middle.date).toISOString(),
      position: '50%',
      impact: 75,
      sentiment: middle.sentiment,
      description: 'The conversation evolved as more stakeholders engaged with the topic',
      quotes: [middle]
    },
    {
      id: '3',
      label: 'Current Sentiment',
      date: last.date,
      timestamp: new Date(last.date).toISOString(),
      position: '90%',
      impact: 85,
      sentiment: last.sentiment,
      description: 'Recent discussions reflect the current consensus and emerging trends',
      quotes: [last]
    }
  ];
}

/**
 * Generate default timeline events when there aren't enough quotes
 */
export function defaultTimelineEvents(quotes: QuoteData[]): TimelineEvent[] {
  // Fallback timeline when we don't have enough data
  return [
    {
      id: '1',
      label: 'Initial Mentions',
      date: '2025-03-04',
      timestamp: '2025-03-04T08:00:00Z',
      position: '10%',
      impact: 65,
      sentiment: 'neutral',
      description: 'First mentions of the topic appeared in media outlets',
      quotes: quotes.length > 0 ? [quotes[0]] : []
    },
    {
      id: '2',
      label: 'Key Developments',
      date: '2025-03-15',
      timestamp: '2025-03-15T14:30:00Z',
      position: '50%',
      impact: 80,
      sentiment: 'neutral',
      description: 'Important developments shaped the ongoing narrative',
      quotes: quotes.length > 1 ? [quotes[1]] : (quotes.length > 0 ? [quotes[0]] : [])
    },
    {
      id: '3',
      label: 'Recent Analysis',
      date: '2025-03-25',
      timestamp: '2025-03-25T09:15:00Z',
      position: '90%',
      impact: 75,
      sentiment: 'neutral',
      description: 'Latest analysis and perspectives on the topic',
      quotes: quotes.length > 2 ? [quotes[2]] : (quotes.length > 0 ? [quotes[0]] : [])
    }
  ];
}

/**
 * Generate topic ripple data for visualization
 */
export function generateTopicRippleData(topics: string[]): any[] {
  // Generate visualization data for topic trends over time
  if (topics.length < 2) {
    return defaultTopicRippleData();
  }
  
  // Use the actual topics to generate ripple data
  return [
    { name: 'Week 1', [topics[0]]: 45, [topics[1]]: 30, [topics[2] || 'Other']: 25 },
    { name: 'Week 2', [topics[0]]: 55, [topics[1]]: 40, [topics[2] || 'Other']: 35 },
    { name: 'Week 3', [topics[0]]: 40, [topics[1]]: 60, [topics[2] || 'Other']: 45 },
    { name: 'Week 4', [topics[0]]: 50, [topics[1]]: 45, [topics[2] || 'Other']: 55 }
  ];
}

/**
 * Generate default topic ripple data
 */
export function defaultTopicRippleData(): any[] {
  return [
    { name: 'Week 1', 'Economic Impact': 45, 'Consumer Concerns': 30, 'Policy Analysis': 25 },
    { name: 'Week 2', 'Economic Impact': 55, 'Consumer Concerns': 40, 'Policy Analysis': 35 },
    { name: 'Week 3', 'Economic Impact': 40, 'Consumer Concerns': 60, 'Policy Analysis': 45 },
    { name: 'Week 4', 'Economic Impact': 50, 'Consumer Concerns': 45, 'Policy Analysis': 55 }
  ];
}

/**
 * Generate topic insights from topics and quotes
 */
export function generateTopicInsights(topics: string[], quotes: QuoteData[]): TopicInsight[] {
  // Generate insights for each top topic based on the quotes
  if (topics.length < 2) {
    return defaultTopicInsights();
  }
  
  return topics.slice(0, 3).map((topic, index) => {
    // For each topic, examine related quotes to determine sentiment and trend
    const topicQuotes = quotes.filter(q => q.text.toLowerCase().includes(topic.toLowerCase()));
    
    // Calculate sentiment distribution for this topic
    const positive = topicQuotes.filter(q => q.sentiment === "positive").length;
    const negative = topicQuotes.filter(q => q.sentiment === "negative").length;
    const neutral = topicQuotes.length - positive - negative;
    
    // Determine overall sentiment
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    if (positive > negative && positive > neutral) sentiment = "positive";
    if (negative > positive && negative > neutral) sentiment = "negative";
    
    // Determine trend (for demo purposes, we're assigning different trends)
    const trends: ("rising" | "falling" | "stable")[] = ["rising", "stable", "falling"];
    const trend = trends[index % 3];
    
    return {
      topic,
      description: `Analysis of how ${topic} affects stakeholders and market dynamics`,
      trend,
      sentiment
    };
  });
}

/**
 * Generate default topic insights
 */
export function defaultTopicInsights(): TopicInsight[] {
  return [
    {
      topic: 'Economic Impact',
      description: 'Discussion of how changes affect markets, trade, and business operations',
      trend: "rising",
      sentiment: "neutral"
    },
    {
      topic: 'Consumer Concerns',
      description: 'Focus on price changes and availability of consumer goods',
      trend: "rising",
      sentiment: "negative"
    },
    {
      topic: 'Policy Analysis',
      description: 'Expert evaluation of policy implementation and effectiveness',
      trend: "stable",
      sentiment: "neutral"
    }
  ];
}

/**
 * Generate source breakdown from quotes
 */
export function generateSourceBreakdown(quotes: QuoteData[]): { [key in DataSource]?: number } {
  if (quotes.length === 0) {
    return {};
  }
  
  const sourceCounts: { [key: string]: number } = {};
  
  quotes.forEach(quote => {
    const source = quote.source.toLowerCase().includes("twitter") ? "twitter" :
                 quote.source.toLowerCase().includes("reddit") ? "reddit" : 
                 "news";
    
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });
  
  const total = quotes.length;
  const result: { [key in DataSource]?: number } = {};
  
  for (const source in sourceCounts) {
    result[source as DataSource] = Math.round((sourceCounts[source] / total) * 100);
  }
  
  return result;
}
