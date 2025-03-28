
import { ResearchQuery, AnalysisResults, QuoteData, DataSource, SentimentFilter } from "../types/qualitativeAnalysisTypes";
import { toast } from "sonner";
import { generateAIInsights, generateTrendsAnalysis } from "../ai/aiInsightsService";
import { fetchTwitterData, fetchRedditData, fetchNewsData } from "./dataSourceApi";
import { handleApiError } from "../utils/apiUtils";
import { generateMockResults } from "../mock/mockDataService";

// Main function to fetch qualitative data from real APIs
export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults> {
  try {
    console.log("Fetching qualitative data for query:", query);
    
    // Track which sources successfully returned data
    const sourceResults: { [key: string]: boolean } = {};
    let quotes: QuoteData[] = [];
    let keywords: string[] = [];
    let topics: string[] = [];
    
    // Focus on News API only for now
    // Override sources to only use 'news'
    const sourcesToQuery = ["news"] as DataSource[];
    
    console.log("Using data sources:", sourcesToQuery);
    
    // Create promise array for parallel API calls
    const apiPromises = sourcesToQuery.map(source => {
      const fetcher = getFetcherForSource(source);
      return fetcher(query).then(result => {
        sourceResults[source] = result.quotes.length > 0;
        quotes = [...quotes, ...result.quotes];
        keywords = [...keywords, ...result.keywords];
        topics = [...topics, ...result.topics];
        console.log(`Data from ${source}:`, result);
        
        // Show toast with data source information
        if (result.quotes.length > 0) {
          toast.success(`Retrieved ${result.quotes.length} quotes from ${source}`);
        }
      }).catch(error => {
        handleApiError(error, `${source} API`);
        sourceResults[source] = false;
      });
    });
    
    // Wait for all API calls to complete
    await Promise.all(apiPromises);
    
    // Filter quotes by sentiment if specified
    if (query.sentiment !== "all") {
      quotes = quotes.filter(quote => quote.sentiment === query.sentiment);
    }
    
    // If no data returned from any source, fall back to mock data
    const anySourceSucceeded = Object.values(sourceResults).some(success => success);
    if (!anySourceSucceeded && Object.keys(sourceResults).length > 0) {
      console.log("No real data available, falling back to mock data");
      
      // Use mock data but inform the user
      toast.info("No data found from available sources, using sample data instead.", {
        description: "Try a different search query or check API connectivity."
      });
      
      return generateMockResults(query);
    }
    
    // Calculate sentiment breakdown
    const sentimentBreakdown = calculateSentimentBreakdown(quotes);
    
    // Generate AI insights and trends analysis
    const aiInsights = generateAIInsights(topics, sentimentBreakdown, keywords, query);
    const trendsAnalysis = [generateTrendsAnalysis(sentimentBreakdown, topics, query)]; // Wrapping in array
    
    // Use the default mock result as a base and override with our real data
    const defaultResult = generateMockResults(query);
    
    return {
      // Use the real data we collected
      topTopics: topics.length > 0 ? topics : defaultResult.topTopics,
      sentimentBreakdown,
      exampleQuotes: quotes.length > 0 ? quotes.slice(0, 10) : defaultResult.exampleQuotes, // Limit to 10 quotes
      keyPhrases: keywords.length > 0 ? keywords : defaultResult.keyPhrases,
      aiInsights: aiInsights.length > 0 ? aiInsights : defaultResult.aiInsights,
      trendsAnalysis,
      reportGeneratedAt: new Date().toISOString(),
      
      // For properties where we don't have real data, use the mock data
      aiSummary: quotes.length > 0 
        ? `Analysis of conversations around "${query.query}" based on ${quotes.length} collected articles.`
        : defaultResult.aiSummary,
      keyInsights: defaultResult.keyInsights,
      challenges: defaultResult.challenges,
      recommendations: defaultResult.recommendations,
      timelineEvents: defaultResult.timelineEvents,
      topicRippleData: defaultResult.topicRippleData,
      topicInsights: defaultResult.topicInsights,
      sourceBreakdown: generateSourceBreakdown(quotes)
    };
  } catch (error) {
    return handleGlobalError(error, query);
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
    return { "news": 100 }; // Default to 100% news if no quotes
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
    return { positive: 33, neutral: 34, negative: 33 }; // Default even distribution
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

// Global error handler for the main function
async function handleGlobalError(error: unknown, query: ResearchQuery): Promise<AnalysisResults> {
  handleApiError(error, "Qualitative data fetching");
  return generateMockResults(query);
}
