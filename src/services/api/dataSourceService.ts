
import { ResearchQuery, AnalysisResults, QuoteData, DataSource } from "../types/qualitativeAnalysisTypes";
import { toast } from "sonner";
import { generateAIInsights, generateTrendsAnalysis } from "../ai/aiInsightsService";
import { fetchTwitterData, fetchRedditData, fetchNewsData } from "./sourceAdapters";
import { handleApiError } from "../utils/apiUtils";

// Main function to fetch qualitative data from real APIs
export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults> {
  try {
    // Track which sources successfully returned data
    const sourceResults: { [key: string]: boolean } = {};
    let quotes: QuoteData[] = [];
    let keywords: string[] = [];
    let topics: string[] = [];
    
    // Determine which sources to query
    const sourcesToQuery = query.sources as Array<"twitter" | "reddit" | "news">;
    
    // Create promise array for parallel API calls
    const apiPromises = sourcesToQuery.map(source => {
      const fetcher = getFetcherForSource(source);
      return fetcher(query).then(result => {
        sourceResults[source] = result.quotes.length > 0;
        quotes = [...quotes, ...result.quotes];
        keywords = [...keywords, ...result.keywords];
        topics = [...topics, ...result.topics];
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
      
      // Import the mock data generator
      const { generateMockResults } = await import("../mock/mockDataService");
      const mockData = generateMockResults(query);
      
      // Use mock data but inform the user
      toast.info("Using offline data as API requests are restricted in this environment.", {
        description: "Try testing on localhost or using your own API keys for live data."
      });
      
      return mockData;
    }
    
    // Process and prioritize by keywords
    processKeywords(quotes, query);
    
    // Deduplicate and limit keywords and topics
    keywords = Array.from(new Set(keywords)).slice(0, 15);
    topics = Array.from(new Set(topics)).slice(0, 5);
    
    // Calculate sentiment breakdown
    const sentimentBreakdown = calculateSentimentBreakdown(quotes);
    
    // Generate AI insights and trends analysis
    const aiInsights = generateAIInsights(topics, sentimentBreakdown, keywords, query);
    const trendsAnalysis = generateTrendsAnalysis(sentimentBreakdown, topics, query);
    
    return {
      topTopics: topics,
      sentimentBreakdown,
      exampleQuotes: quotes.slice(0, 10), // Limit to 10 quotes
      keyPhrases: keywords,
      aiInsights,
      trendsAnalysis,
      reportGeneratedAt: new Date().toISOString()
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
      return fetchTwitterData; // Default fallback
  }
}

// Process and prioritize quotes by keywords
function processKeywords(quotes: QuoteData[], query: ResearchQuery): void {
  if (query.keywords.length > 0) {
    // If user specified keywords, prioritize content containing those keywords
    const keywordRegex = new RegExp(query.keywords.join("|"), "i");
    quotes.sort((a, b) => {
      const aHasKeyword = keywordRegex.test(a.text);
      const bHasKeyword = keywordRegex.test(b.text);
      return (bHasKeyword ? 1 : 0) - (aHasKeyword ? 1 : 0);
    });
  }
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
  
  // Import the mock data generator only when needed
  const { generateMockResults } = await import("../mock/mockDataService");
  return generateMockResults(query);
}
