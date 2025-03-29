import { ResearchQuery, AnalysisResults, QuoteData, DataSource, SentimentFilter, TimelineEvent, TopicInsight } from "../types/qualitativeAnalysisTypes";
import { toast } from "sonner";
import { generateAIInsights, generateTrendsAnalysis } from "../ai/aiInsightsService";
import { fetchTwitterData, fetchRedditData, fetchNewsData } from "./dataSourceApi";
import { handleApiError } from "../utils/apiUtils";

export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults | null> {
  try {
    console.log("Fetching qualitative data for query:", query);
    
    const sourceResults: { [key: string]: boolean } = {};
    let quotes: QuoteData[] = [];
    let keywords: string[] = [];
    let topics: string[] = [];
    
    const sourcesToQuery = query.sources || ["news"];
    
    console.log("Using data sources:", sourcesToQuery);
    
    const apiPromises = sourcesToQuery.map(source => {
      const fetcher = getFetcherForSource(source);
      return fetcher(query).then(result => {
        console.log(`Received data from ${source}:`, result);
        
        sourceResults[source] = result.quotes.length > 0;
        
        if (result.quotes.length > 0) {
          quotes = [...quotes, ...result.quotes];
          keywords = [...keywords, ...result.keywords];
          topics = [...topics, ...result.topics];
          
          toast.success(`Retrieved ${result.quotes.length} quotes from ${source}`);
        } else {
          console.warn(`No quotes returned from ${source}`);
        }
      }).catch(error => {
        handleApiError(error, `${source} API`);
        sourceResults[source] = false;
      });
    });
    
    await Promise.all(apiPromises);
    
    const anySourceSucceeded = Object.values(sourceResults).some(success => success);
    if (!anySourceSucceeded || quotes.length === 0) {
      console.log("No data returned from any source");
      
      toast.info("No data found from available sources. Try a different search query or check Edge Function deployment.", {
        duration: 5000
      });
      
      return null;
    }
    
    if (query.sentiment !== "all") {
      quotes = quotes.filter(quote => quote.sentiment === query.sentiment);
      
      if (quotes.length === 0) {
        toast.info(`No ${query.sentiment} sentiment quotes found in the results`, {
          description: "Try selecting 'all' for sentiment filtering",
          duration: 5000
        });
        return null;
      }
    }
    
    const sentimentBreakdown = calculateSentimentBreakdown(quotes);
    
    const aiInsights = generateAIInsights(topics, sentimentBreakdown, keywords, query);
    const trendsAnalysis = [generateTrendsAnalysis(sentimentBreakdown, topics, query)];
    
    const mockKeyInsights = [
      `Most discussions about "${query.query}" focus on economic impact`,
      `There's significant concern about price increases affecting consumers`,
      `Business and policy perspectives dominate the narrative`
    ];
    
    const mockChallenges = [
      `Communicating complex policy implications to general audience`,
      `Balancing different industry perspectives in reporting`,
      `Separating political rhetoric from economic analysis`
    ];
    
    const mockRecommendations = [
      `Focus messaging on concrete consumer impacts`,
      `Provide context with historical data comparisons`,
      `Include diverse stakeholder perspectives in analysis`
    ];
    
    const mockTimelineEvents: TimelineEvent[] = [
      {
        id: '1',
        label: 'Initial Announcement',
        date: '2025-03-04',
        timestamp: '2025-03-04T08:00:00Z',
        position: '10%',
        impact: 65,
        sentiment: 'neutral',
        description: 'First mentions of the topic appeared in mainstream news outlets',
        quotes: [quotes[0]]
      },
      {
        id: '2',
        label: 'Business Response',
        date: '2025-03-07',
        timestamp: '2025-03-07T14:30:00Z',
        position: '40%',
        impact: 80,
        sentiment: 'neutral',
        description: 'Major corporations began issuing statements about potential impacts',
        quotes: [quotes[1]]
      },
      {
        id: '3',
        label: 'Media Analysis',
        date: '2025-03-20',
        timestamp: '2025-03-20T09:15:00Z',
        position: '70%',
        impact: 45,
        sentiment: 'negative',
        description: 'In-depth analysis pieces explored long-term implications',
        quotes: quotes.length > 5 ? [quotes[5]] : [quotes[0]]
      }
    ];
    
    const mockTopicRippleData = [
      { name: 'Week 1', 'Economic Impact': 45, 'Consumer Concerns': 30, 'Policy Analysis': 25 },
      { name: 'Week 2', 'Economic Impact': 55, 'Consumer Concerns': 40, 'Policy Analysis': 35 },
      { name: 'Week 3', 'Economic Impact': 40, 'Consumer Concerns': 60, 'Policy Analysis': 45 },
      { name: 'Week 4', 'Economic Impact': 50, 'Consumer Concerns': 45, 'Policy Analysis': 55 }
    ];
    
    const mockTopicInsights: TopicInsight[] = [
      {
        topic: 'Economic Impact',
        description: 'Discussion of how changes affect markets, trade, and business operations',
        trend: 'rising',
        sentiment: 'neutral'
      },
      {
        topic: 'Consumer Concerns',
        description: 'Focus on price changes and availability of consumer goods',
        trend: 'rising',
        sentiment: 'negative'
      },
      {
        topic: 'Policy Analysis',
        description: 'Expert evaluation of policy implementation and effectiveness',
        trend: 'stable',
        sentiment: 'neutral'
      }
    ];
    
    return {
      topTopics: topics,
      sentimentBreakdown,
      exampleQuotes: quotes.slice(0, 10),
      keyPhrases: keywords,
      aiInsights,
      trendsAnalysis,
      reportGeneratedAt: new Date().toISOString(),
      aiSummary: `Analysis of conversations around "${query.query}" based on ${quotes.length} collected articles.`,
      keyInsights: mockKeyInsights,
      challenges: mockChallenges,
      recommendations: mockRecommendations,
      timelineEvents: mockTimelineEvents,
      topicRippleData: mockTopicRippleData,
      topicInsights: mockTopicInsights,
      sourceBreakdown: generateSourceBreakdown(quotes)
    };
  } catch (error) {
    handleApiError(error, "Qualitative data fetching");
    return null;
  }
}

function getFetcherForSource(source: string) {
  switch (source) {
    case "twitter":
      return fetchTwitterData;
    case "reddit":
      return fetchRedditData;
    case "news":
      return fetchNewsData;
    default:
      return fetchNewsData;
  }
}

function generateSourceBreakdown(quotes: QuoteData[]): { [key in DataSource]?: number } {
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

function calculateSentimentBreakdown(quotes: QuoteData[]): { positive: number; neutral: number; negative: number } {
  if (quotes.length === 0) {
    return { positive: 0, neutral: 0, negative: 0 };
  }
  
  const sentimentCounts = quotes.reduce(
    (counts, quote) => {
      counts[quote.sentiment]++;
      return counts;
    },
    { positive: 0, neutral: 0, negative: 0 } as { [key: string]: number }
  );
  
  const total = quotes.length;
  return {
    positive: Math.round((sentimentCounts.positive / total) * 100),
    neutral: Math.round((sentimentCounts.neutral / total) * 100),
    negative: Math.round((sentimentCounts.negative / total) * 100)
  };
}
