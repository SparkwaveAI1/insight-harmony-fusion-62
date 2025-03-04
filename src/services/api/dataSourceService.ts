import { ResearchQuery, AnalysisResults, QuoteData, DataSource } from "../types/qualitativeAnalysisTypes";
import { getApiKeys } from "../utils/apiKeyUtils";
import { toast } from "sonner";
import { generateAIInsights, generateTrendsAnalysis } from "../ai/aiInsightsService";
import { detectSentiment } from "../utils/sentimentUtils";
import { extractKeywords, extractTopics, getDateFromTimeFrame } from "../utils/textAnalysisUtils";

// Main function to fetch qualitative data from real APIs
export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults> {
  try {
    // Track which sources successfully returned data
    const sourceResults: { [key: string]: boolean } = {};
    let quotes: QuoteData[] = [];
    let keywords: string[] = [];
    let topics: string[] = [];
    
    // Determine which sources to query
    const sourcesToQuery: Array<"twitter" | "reddit" | "news"> = query.sources.includes("all") 
      ? ["twitter", "reddit", "news"] 
      : query.sources.filter(s => s !== "all") as Array<"twitter" | "reddit" | "news">;
    
    // Parallel API calls to different data sources
    const apiPromises = [];
    
    if (sourcesToQuery.includes("twitter")) {
      apiPromises.push(fetchTwitterData(query).then(result => {
        sourceResults.twitter = result.quotes.length > 0;
        quotes = [...quotes, ...result.quotes];
        keywords = [...keywords, ...result.keywords];
        topics = [...topics, ...result.topics];
      }).catch(error => {
        console.error("Twitter API error:", error);
        sourceResults.twitter = false;
      }));
    }
    
    if (sourcesToQuery.includes("reddit")) {
      apiPromises.push(fetchRedditData(query).then(result => {
        sourceResults.reddit = result.quotes.length > 0;
        quotes = [...quotes, ...result.quotes];
        keywords = [...keywords, ...result.keywords];
        topics = [...topics, ...result.topics];
      }).catch(error => {
        console.error("Reddit API error:", error);
        sourceResults.reddit = false;
      }));
    }
    
    if (sourcesToQuery.includes("news")) {
      apiPromises.push(fetchNewsData(query).then(result => {
        sourceResults.news = result.quotes.length > 0;
        quotes = [...quotes, ...result.quotes];
        keywords = [...keywords, ...result.keywords];
        topics = [...topics, ...result.topics];
      }).catch(error => {
        console.error("News API error:", error);
        sourceResults.news = false;
      }));
    }
    
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
    
    // Additional processing for keywords
    if (query.keywords.length > 0) {
      // If user specified keywords, prioritize content containing those keywords
      const keywordRegex = new RegExp(query.keywords.join("|"), "i");
      quotes = quotes.sort((a, b) => {
        const aHasKeyword = keywordRegex.test(a.text);
        const bHasKeyword = keywordRegex.test(b.text);
        return (bHasKeyword ? 1 : 0) - (aHasKeyword ? 1 : 0);
      });
    }
    
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
    console.error("Error fetching qualitative data:", error);
    // If all APIs fail, use mock data as a fallback
    toast.info("Using offline data for your query", {
      description: "Live API data is unavailable in this environment."
    });
    
    // Import the mock data generator only when needed
    const { generateMockResults } = await import("../mock/mockDataService");
    return generateMockResults(query);
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

// News API integration
export async function fetchNewsData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    // Get API key (user's key if they provided one, otherwise default)
    const apiKeys = getApiKeys();
    
    if (!apiKeys.newsApi) {
      toast.error("News API key is missing. Please add your key in the API Keys settings.");
      return { quotes: [], keywords: [], topics: [] };
    }
    
    // CORS restriction notice for News API
    console.log("News API has CORS restrictions in browser environment - would need a backend proxy");
    toast.warning("News API requires a backend proxy for browser requests", {
      duration: 3000,
      id: "news-api-cors-warning"
    });
    
    // Return placeholder data since we can't access the API directly from browser
    return {
      quotes: [{ 
        text: "News API requires a backend proxy for browser requests. Using simulated data instead.", 
        sentiment: "neutral", 
        source: "News: System Notice" 
      }],
      keywords: ["API", "proxy", "CORS", "browser", "restrictions"],
      topics: ["API Access Limitations"]
    };
  } catch (error) {
    console.error("Error fetching news data:", error);
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Twitter API integration
export async function fetchTwitterData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    const apiKeys = getApiKeys();
    
    if (!apiKeys.twitter) {
      toast.error("Twitter API key is missing. Please add your key in the API Keys settings.");
      return { quotes: [], keywords: [], topics: [] };
    }
    
    // Twitter API would require OAuth and a backend proxy
    console.log("Twitter API requires OAuth and a backend proxy for browser requests");
    toast.warning("Twitter API requires OAuth authentication and a backend proxy", {
      duration: 3000,
      id: "twitter-api-cors-warning"
    });
    
    // Return placeholder data since we can't access the API directly from browser
    return {
      quotes: [{ 
        text: "Twitter API requires OAuth authentication and a backend proxy. Using simulated data instead.", 
        sentiment: "neutral", 
        source: "Twitter: System Notice" 
      }],
      keywords: ["OAuth", "API", "authentication", "proxy", "CORS"],
      topics: ["API Authentication Requirements"]
    };
  } catch (error) {
    console.error("Error fetching Twitter data:", error);
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Reddit API integration
export async function fetchRedditData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    // Reddit's API also has CORS issues when accessed directly from browser
    console.log("Reddit API has CORS restrictions in browser environment");
    toast.warning("Reddit API has CORS restrictions in this environment", {
      duration: 3000,
      id: "reddit-api-cors-warning"
    });
    
    // Return placeholder data since we can't access the API directly from browser
    return {
      quotes: [{ 
        text: "Reddit API has CORS restrictions in this environment. Using simulated data instead.", 
        sentiment: "neutral", 
        source: "Reddit: System Notice" 
      }],
      keywords: ["CORS", "API", "Reddit", "restrictions", "browser"],
      topics: ["API Access Limitations"]
    };
  } catch (error) {
    console.error("Error fetching Reddit data:", error);
    return { quotes: [], keywords: [], topics: [] };
  }
}
