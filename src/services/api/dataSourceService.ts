
import { ResearchQuery, AnalysisResults, QuoteData, DataSource, SentimentFilter } from "../types/qualitativeAnalysisTypes";
import { toast } from "sonner";
import { generateAIInsights, generateTrendsAnalysis } from "../ai/aiInsightsService";
import { fetchTwitterData, fetchRedditData, fetchNewsData } from "./dataSourceApi";
import { handleApiError } from "../utils/apiUtils";

// Main function to fetch qualitative data from real APIs
export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults | null> {
  try {
    console.log("Fetching qualitative data for query:", query);
    
    // Track which sources successfully returned data
    const sourceResults: { [key: string]: boolean } = {};
    let quotes: QuoteData[] = [];
    let keywords: string[] = [];
    let topics: string[] = [];
    
    // Use the sources that the user has selected
    const sourcesToQuery = query.sources || ["news"];
    
    console.log("Using data sources:", sourcesToQuery);
    
    // Create promise array for parallel API calls
    const apiPromises = sourcesToQuery.map(source => {
      const fetcher = getFetcherForSource(source);
      return fetcher(query).then(result => {
        console.log(`Received data from ${source}:`, result);
        
        // Mark this source as successful only if it returned quotes
        sourceResults[source] = result.quotes.length > 0;
        
        // Only add data if we actually got quotes
        if (result.quotes.length > 0) {
          quotes = [...quotes, ...result.quotes];
          keywords = [...keywords, ...result.keywords];
          topics = [...topics, ...result.topics];
          
          // Show toast with data source information
          toast.success(`Retrieved ${result.quotes.length} quotes from ${source}`);
        } else {
          console.warn(`No quotes returned from ${source}`);
        }
      }).catch(error => {
        handleApiError(error, `${source} API`);
        sourceResults[source] = false;
      });
    });
    
    // Wait for all API calls to complete
    await Promise.all(apiPromises);
    
    // If no data returned from any source, return null
    const anySourceSucceeded = Object.values(sourceResults).some(success => success);
    if (!anySourceSucceeded || quotes.length === 0) {
      console.log("No data returned from any source");
      
      toast.info("No data found from available sources. Try a different search query or check Edge Function deployment.", {
        duration: 5000
      });
      
      return null;
    }
    
    // Filter quotes by sentiment if specified
    if (query.sentiment !== "all") {
      quotes = quotes.filter(quote => quote.sentiment === query.sentiment);
      
      // If filtering left us with no quotes, return null
      if (quotes.length === 0) {
        toast.info(`No ${query.sentiment} sentiment quotes found in the results`, {
          description: "Try selecting 'all' for sentiment filtering",
          duration: 5000
        });
        return null;
      }
    }
    
    // Calculate sentiment breakdown
    const sentimentBreakdown = calculateSentimentBreakdown(quotes);
    
    // Generate AI insights and trends analysis
    const aiInsights = generateAIInsights(topics, sentimentBreakdown, keywords, query);
    const trendsAnalysis = [generateTrendsAnalysis(sentimentBreakdown, topics, query)];
    
    // Create mock timeline events, challenges, recommendations and other data
    // that would normally come from a more sophisticated analysis
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
    
    // Create some mock timeline events
    const mockTimelineEvents = [
      {
        id: '1',
        label: 'Initial Announcement',
        date: '2025-03-04',
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
        position: '70%',
        impact: 45,
        sentiment: 'negative',
        description: 'In-depth analysis pieces explored long-term implications',
        quotes: [quotes[5]]
      }
    ];
    
    // Create mock ripple data for topic visualization
    const mockTopicRippleData = [
      { name: 'Week 1', 'Economic Impact': 45, 'Consumer Concerns': 30, 'Policy Analysis': 25 },
      { name: 'Week 2', 'Economic Impact': 55, 'Consumer Concerns': 40, 'Policy Analysis': 35 },
      { name: 'Week 3', 'Economic Impact': 40, 'Consumer Concerns': 60, 'Policy Analysis': 45 },
      { name: 'Week 4', 'Economic Impact': 50, 'Consumer Concerns': 45, 'Policy Analysis': 55 }
    ];
    
    // Create mock topic insights
    const mockTopicInsights = [
      {
        topic: 'Economic Impact',
        description: 'Discussion of how changes affect markets, trade, and business operations',
        trend: 'Increasing',
        sentiment: 'neutral'
      },
      {
        topic: 'Consumer Concerns',
        description: 'Focus on price changes and availability of consumer goods',
        trend: 'Rapidly increasing',
        sentiment: 'negative'
      },
      {
        topic: 'Policy Analysis',
        description: 'Expert evaluation of policy implementation and effectiveness',
        trend: 'Steady',
        sentiment: 'neutral'
      }
    ];
    
    return {
      topTopics: topics,
      sentimentBreakdown,
      exampleQuotes: quotes.slice(0, 10), // Limit to 10 quotes
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

// Helper function to get the appropriate fetcher for each source
function getFetcherForSource(source: string) {
  switch (source) {
    case "twitter":
      return fetchTwitterData;
    case "reddit":
      return fetchRedditData;
    case "news":
      return fetchNewsData;
    default:
      return fetchNewsData; // Default to news API
  }
}

// Generate source breakdown based on quotes
function generateSourceBreakdown(quotes: QuoteData[]): { [key in DataSource]?: number } {
  if (quotes.length === 0) {
    return {}; // Return empty object if no quotes
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

// Calculate sentiment breakdown from quotes
function calculateSentimentBreakdown(quotes: QuoteData[]): { positive: number; neutral: number; negative: number } {
  if (quotes.length === 0) {
    return { positive: 0, neutral: 0, negative: 0 }; // Return zeros for empty quotes
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
