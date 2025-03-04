
import { toast } from "sonner";

export type DataSource = "twitter" | "reddit" | "news" | "farcaster" | "all";
export type SentimentFilter = "positive" | "neutral" | "negative" | "all";
export type TimeFrame = "real-time" | "short-term" | "medium-term" | "long-term";

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
}

// API configuration - replace with your actual API keys
const API_KEYS = {
  // Use your News API key here
  newsApi: "1dbe0abf78c24a02a593ce5ba0b1c6fa", // This is a publishable key, not a secret
  
  // Twitter API v2 requires authentication
  // You can use a bearer token with read-only access
  twitter: "", // For production, this should be managed securely
  
  // Reddit doesn't require an API key for public data in many cases
  // but you might need to set up an app and get credentials for higher rate limits
  reddit: "",
};

// Main function to fetch data from multiple sources
export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults> {
  console.log("Fetching qualitative data for:", query);
  
  try {
    // Track fetching status
    const sources = query.sources.includes("all") 
      ? ["news", "twitter", "reddit"] 
      : query.sources;
    
    // Initialize results
    let combinedQuotes: QuoteData[] = [];
    let allKeywords: string[] = [];
    let topics: string[] = [];
    
    // Fetch data from each source in parallel
    const promises = sources.map(source => {
      switch(source) {
        case "news":
          return fetchNewsData(query);
        case "twitter":
          return fetchTwitterData(query);
        case "reddit":
          return fetchRedditData(query);
        case "farcaster":
          // Farcaster isn't implemented yet, return empty data
          return Promise.resolve({ quotes: [], keywords: [], topics: [] });
        default:
          return Promise.resolve({ quotes: [], keywords: [], topics: [] });
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    // Process results from all sources
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const sourceData = result.value;
        combinedQuotes = [...combinedQuotes, ...sourceData.quotes];
        allKeywords = [...allKeywords, ...sourceData.keywords];
        topics = [...topics, ...sourceData.topics];
      } else {
        console.error(`Error fetching from ${sources[index]}:`, result.reason);
        toast.error(`Could not fetch data from ${sources[index]}`);
      }
    });
    
    // If we have no data at all, fall back to mock data
    if (combinedQuotes.length === 0) {
      toast.warning("Using sample data as no API results were available");
      return generateMockResults(query);
    }
    
    // Calculate sentiment breakdown from the quotes we collected
    const sentimentBreakdown = calculateSentimentBreakdown(combinedQuotes);
    
    // Filter quotes based on sentiment preference
    let filteredQuotes = combinedQuotes;
    if (query.sentiment !== "all") {
      filteredQuotes = combinedQuotes.filter(quote => quote.sentiment === query.sentiment);
    }
    
    // Select a few representative quotes
    const exampleQuotes = selectRepresentativeQuotes(filteredQuotes, query.sentiment);
    
    // Count keyword frequencies and get the top ones
    const keyPhrases = getTopKeywords(allKeywords, 12);
    
    // Select top topics
    const topTopics = selectTopTopics(topics);
    
    return {
      topTopics,
      sentimentBreakdown,
      exampleQuotes,
      keyPhrases
    };
  } catch (error) {
    console.error("Error in fetchQualitativeData:", error);
    toast.error("Failed to fetch analysis data. Using sample data instead.");
    return generateMockResults(query);
  }
}

// News API integration
async function fetchNewsData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    // Convert timeframe to date range for News API
    const from = getDateFromTimeFrame(query.timeFrame);
    
    // Build News API URL
    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.append("q", `${query.query} ${query.keywords.join(" ")}`);
    url.searchParams.append("from", from);
    url.searchParams.append("sortBy", "relevancy");
    url.searchParams.append("language", "en");
    url.searchParams.append("pageSize", "10");
    url.searchParams.append("apiKey", API_KEYS.newsApi);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("News API error:", errorData);
      
      if (response.status === 401) {
        toast.error("News API key is invalid or missing");
      } else if (response.status === 429) {
        toast.error("News API rate limit exceeded");
      } else {
        toast.error(`News API error: ${errorData.message || response.statusText}`);
      }
      
      return { quotes: [], keywords: [], topics: [] };
    }
    
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      // Extract quotes from articles
      const quotes: QuoteData[] = data.articles.slice(0, 5).map((article: any) => {
        // Simple sentiment detection based on title and description
        const sentiment = detectSentiment(article.title + " " + (article.description || ""));
        
        return {
          text: article.description || article.title,
          sentiment,
          source: "News: " + article.source.name
        };
      });
      
      // Extract keywords from titles
      const keywords = extractKeywords(data.articles.map((a: any) => a.title).join(" "));
      
      // Extract potential topics
      const topics = extractTopics(data.articles.map((a: any) => a.title + " " + (a.description || "")).join(" "));
      
      return { quotes, keywords, topics };
    }
    
    return { quotes: [], keywords: [], topics: [] };
  } catch (error) {
    console.error("Error fetching news data:", error);
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Twitter API integration
async function fetchTwitterData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  // Twitter API requires authentication and the free tier is limited
  // For now, we'll return a message explaining the limitation
  
  // In a real implementation, you would:
  // 1. Set up proper Twitter API authentication
  // 2. Use the Twitter API v2 search endpoint
  // 3. Process the tweets and extract sentiment
  
  if (!API_KEYS.twitter) {
    console.log("Twitter API integration requires authentication setup");
    return { 
      quotes: [{
        text: "Twitter API integration requires authentication. Please set up Twitter API credentials to access real data.",
        sentiment: "neutral",
        source: "Twitter"
      }], 
      keywords: ["twitter", "api", "authentication"], 
      topics: ["Twitter API Integration"] 
    };
  }
  
  // Mock implementation - would be replaced with real API call
  return { quotes: [], keywords: [], topics: [] };
}

// Reddit API integration
async function fetchRedditData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    // Reddit's API allows some access without authentication
    const searchTerm = encodeURIComponent(`${query.query} ${query.keywords.join(" ")}`);
    const url = `https://www.reddit.com/search.json?q=${searchTerm}&sort=relevance&limit=10`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Reddit API error:", response.statusText);
      return { quotes: [], keywords: [], topics: [] };
    }
    
    const data = await response.json();
    
    if (data.data && data.data.children && data.data.children.length > 0) {
      // Extract quotes from posts
      const quotes: QuoteData[] = data.data.children
        .filter((post: any) => post.data.selftext || post.data.title)
        .slice(0, 5)
        .map((post: any) => {
          const text = post.data.selftext || post.data.title;
          // Simple sentiment detection
          const sentiment = detectSentiment(text);
          
          return {
            text: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
            sentiment,
            source: `Reddit: r/${post.data.subreddit}`
          };
        });
      
      // Extract keywords from titles and texts
      const keywords = extractKeywords(
        data.data.children.map((post: any) => 
          post.data.title + " " + (post.data.selftext || "")
        ).join(" ")
      );
      
      // Extract potential topics
      const topics = extractTopics(
        data.data.children.map((post: any) => 
          post.data.title + " " + (post.data.selftext || "")
        ).join(" ")
      );
      
      return { quotes, keywords, topics };
    }
    
    return { quotes: [], keywords: [], topics: [] };
  } catch (error) {
    console.error("Error fetching Reddit data:", error);
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Helper functions

// Simple sentiment analysis
function detectSentiment(text: string): string {
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'amazing', 'wonderful', 'love', 'enjoy', 'happy', 'success', 'improve', 'benefit', 'opportunity'];
  const negativeWords = ['bad', 'poor', 'terrible', 'negative', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'failure', 'decline', 'risk', 'problem', 'issue', 'concern'];
  
  const lowerText = text.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) positiveScore += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) negativeScore += matches.length;
  });
  
  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
}

// Extract potential keywords
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\W+/);
  const wordCounts: Record<string, number> = {};
  
  // Common stopwords to filter out
  const stopwords = ["the", "and", "a", "to", "of", "in", "is", "it", "that", "for", "on", "with", "as", "be", "by", "at", "this", "an", "are", "was", "but", "or", "have", "not", "from"];
  
  words.forEach(word => {
    if (word.length > 3 && !stopwords.includes(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Sort by frequency
  return Object.keys(wordCounts)
    .sort((a, b) => wordCounts[b] - wordCounts[a])
    .slice(0, 20);
}

// Extract potential topics
function extractTopics(text: string): string[] {
  // This is a very simple implementation
  // In a real app, you'd use NLP libraries or ML models
  
  const topicPatterns = [
    { regex: /\b(regulations?|compliance|regulatory|govern|law|legal)\b/gi, topic: "Regulatory concerns" },
    { regex: /\b(security|secure|protect|breach|hack|risk|threat)\b/gi, topic: "Security considerations" },
    { regex: /\b(adoption|implement|integrat|use case|utility)\b/gi, topic: "Adoption challenges" },
    { regex: /\b(profit|revenue|roi|return|invest|yield|apy|reward)\b/gi, topic: "Profit potential" },
    { regex: /\b(tech|technology|platform|protocol|infra|system)\b/gi, topic: "Technology infrastructure" },
    { regex: /\b(environment|sustainable|green|energy|climate|carbon)\b/gi, topic: "Environmental impact" },
    { regex: /\b(community|social|user|audience|people|market)\b/gi, topic: "Community engagement" },
    { regex: /\b(future|roadmap|develop|update|version|plan)\b/gi, topic: "Future development" },
  ];
  
  const foundTopics: Record<string, number> = {};
  
  topicPatterns.forEach(({ regex, topic }) => {
    const matches = text.match(regex);
    if (matches) {
      foundTopics[topic] = matches.length;
    }
  });
  
  // Sort by relevance (number of matches)
  return Object.keys(foundTopics)
    .sort((a, b) => foundTopics[b] - foundTopics[a]);
}

// Calculate sentiment breakdown from quotes
function calculateSentimentBreakdown(quotes: QuoteData[]): { positive: number; neutral: number; negative: number } {
  if (quotes.length === 0) {
    return { positive: 33, neutral: 34, negative: 33 };
  }
  
  const counts = {
    positive: quotes.filter(q => q.sentiment === "positive").length,
    neutral: quotes.filter(q => q.sentiment === "neutral").length,
    negative: quotes.filter(q => q.sentiment === "negative").length,
  };
  
  const total = quotes.length;
  
  return {
    positive: Math.round((counts.positive / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    negative: Math.round((counts.negative / total) * 100)
  };
}

// Select representative quotes to display
function selectRepresentativeQuotes(quotes: QuoteData[], sentimentFilter: SentimentFilter): QuoteData[] {
  if (quotes.length === 0) return [];
  
  // Ensure we have quotes of each sentiment unless filtered
  if (sentimentFilter === "all") {
    const positiveQuotes = quotes.filter(q => q.sentiment === "positive");
    const neutralQuotes = quotes.filter(q => q.sentiment === "neutral");
    const negativeQuotes = quotes.filter(q => q.sentiment === "negative");
    
    return [
      ...(positiveQuotes.length > 0 ? [positiveQuotes[0]] : []),
      ...(neutralQuotes.length > 0 ? [neutralQuotes[0]] : []),
      ...(negativeQuotes.length > 0 ? [negativeQuotes[0]] : []),
    ];
  }
  
  // Otherwise return the top 3 quotes (or fewer if we don't have 3)
  return quotes.slice(0, 3);
}

// Get top keywords sorted by frequency
function getTopKeywords(keywords: string[], count: number): string[] {
  const wordCounts: Record<string, number> = {};
  
  keywords.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  return Object.keys(wordCounts)
    .sort((a, b) => wordCounts[b] - wordCounts[a])
    .slice(0, count);
}

// Select top topics with deduplication
function selectTopTopics(topics: string[]): string[] {
  // Remove duplicates
  const uniqueTopics = [...new Set(topics)];
  
  // Return top 3 topics, or fewer if we don't have 3
  return uniqueTopics.slice(0, 3);
}

// Convert timeframe to date for News API
function getDateFromTimeFrame(timeFrame: TimeFrame): string {
  const now = new Date();
  
  switch (timeFrame) {
    case "real-time":
      // Last 24 hours
      now.setDate(now.getDate() - 1);
      break;
    case "short-term":
      // Last week
      now.setDate(now.getDate() - 7);
      break;
    case "medium-term":
      // Last month
      now.setMonth(now.getMonth() - 1);
      break;
    case "long-term":
      // Last 3 months
      now.setMonth(now.getMonth() - 3);
      break;
  }
  
  return now.toISOString().split('T')[0];
}

// Fallback to generate mock results if API calls fail
function generateMockResults(query: ResearchQuery): AnalysisResults {
  const topTopics = generateTopTopics(query);
  const sentimentBreakdown = generateSentimentBreakdown(query);
  const exampleQuotes = generateExampleQuotes(query);
  const keyPhrases = generateKeyPhrases(query);
  
  return {
    topTopics,
    sentimentBreakdown,
    exampleQuotes,
    keyPhrases
  };
}

// The following functions are from the original mock implementation
// and are used as fallback if API calls fail

function generateTopTopics(query: ResearchQuery): string[] {
  const queryText = query.query.toLowerCase();
  
  if (queryText.includes("token") || queryText.includes("staking")) {
    return [
      "Staking rewards uncertainty",
      "Security risks in new platforms",
      "Regulatory fears affecting adoption"
    ];
  } else if (queryText.includes("regulation") || queryText.includes("compliance")) {
    return [
      "Regulatory uncertainty in major markets",
      "Compliance costs for small projects",
      "Impact of regulations on innovation"
    ];
  } else if (queryText.includes("nft") || queryText.includes("collectible")) {
    return [
      "Utility beyond speculation",
      "Environmental impact concerns",
      "Integration with traditional art markets"
    ];
  } else {
    return [
      "User adoption challenges",
      "Technology integration issues",
      "Market sentiment shifts"
    ];
  }
}

function generateSentimentBreakdown(query: ResearchQuery): { positive: number; neutral: number; negative: number } {
  if (query.sentiment === "positive") {
    return { positive: 75, neutral: 20, negative: 5 };
  } else if (query.sentiment === "negative") {
    return { positive: 25, neutral: 30, negative: 45 };
  } else if (query.sentiment === "neutral") {
    return { positive: 30, neutral: 60, negative: 10 };
  } else {
    // Create a more random distribution for "all" sentiment
    const positive = 30 + Math.floor(Math.random() * 30);
    const negative = Math.floor(Math.random() * 30);
    const neutral = 100 - positive - negative;
    return { positive, neutral, negative };
  }
}

function generateExampleQuotes(query: ResearchQuery): QuoteData[] {
  const queryText = query.query.toLowerCase();
  const sources = query.sources.includes("all") 
    ? ["Twitter", "Reddit", "News"] 
    : query.sources.map(s => s.charAt(0).toUpperCase() + s.slice(1));
  
  const quotes: QuoteData[] = [];
  
  // Positive quote
  if (query.sentiment === "all" || query.sentiment === "positive") {
    if (queryText.includes("token") || queryText.includes("staking")) {
      quotes.push({
        text: "I've been staking my tokens for 3 months and the rewards have been consistent and higher than expected.",
        sentiment: "positive",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    } else {
      quotes.push({
        text: "This innovation is exactly what the industry needed. I'm seeing significant benefits already.",
        sentiment: "positive",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    }
  }
  
  // Neutral quote
  if (query.sentiment === "all" || query.sentiment === "neutral") {
    if (queryText.includes("token") || queryText.includes("staking")) {
      quotes.push({
        text: "The security of these new staking platforms is still unproven. I'm waiting to see more audits.",
        sentiment: "neutral",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    } else {
      quotes.push({
        text: "There are both pros and cons to this approach. We need more data before making definitive judgments.",
        sentiment: "neutral",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    }
  }
  
  // Negative quote
  if (query.sentiment === "all" || query.sentiment === "negative") {
    if (queryText.includes("token") || queryText.includes("staking")) {
      quotes.push({
        text: "Regulatory uncertainty makes me hesitant to lock up my assets in staking contracts for long periods.",
        sentiment: "negative",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    } else {
      quotes.push({
        text: "I've been disappointed by the results so far. The promised benefits aren't materializing as expected.",
        sentiment: "negative",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    }
  }
  
  return quotes;
}

function generateKeyPhrases(query: ResearchQuery): string[] {
  const baseKeywords = ["adoption", "implementation", "community feedback", "future development"];
  const queryText = query.query.toLowerCase();
  
  // Add query-specific keywords
  if (queryText.includes("token") || queryText.includes("staking")) {
    return [
      ...baseKeywords,
      "high APY", 
      "liquidity concerns", 
      "validator requirements", 
      "regulatory compliance", 
      "reward distribution", 
      "lock-up periods", 
      "slashing risks"
    ];
  } else if (queryText.includes("nft") || queryText.includes("collectible")) {
    return [
      ...baseKeywords,
      "floor price", 
      "rarity attributes", 
      "royalty payments", 
      "secondary markets", 
      "utility features", 
      "authenticating ownership"
    ];
  } else {
    return [
      ...baseKeywords,
      "technical integration", 
      "user experience", 
      "security features", 
      "competitive advantage", 
      "market timing", 
      "innovation factors"
    ];
  }
}
