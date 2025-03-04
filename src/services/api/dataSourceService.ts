
import { ResearchQuery, AnalysisResults, QuoteData } from "../types/qualitativeAnalysisTypes";
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
    const sourcesToQuery = query.sources.includes("all") 
      ? ["twitter", "reddit", "news"] 
      : query.sources;
    
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
    
    // If no data returned from any source, show error
    const anySourceSucceeded = Object.values(sourceResults).some(success => success);
    if (!anySourceSucceeded && Object.keys(sourceResults).length > 0) {
      toast.error("Could not fetch data from any selected source. Please check your API keys.");
      throw new Error("Failed to fetch data from all sources");
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
    toast.error("Failed to fetch real data. Using offline fallback data instead.");
    
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
    
    // Convert timeframe to date range for News API
    const from = getDateFromTimeFrame(query.timeFrame);
    
    // Build News API URL
    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.append("q", `${query.query} ${query.keywords.join(" ")}`);
    url.searchParams.append("from", from);
    url.searchParams.append("sortBy", "relevancy");
    url.searchParams.append("language", "en");
    url.searchParams.append("pageSize", "10");
    url.searchParams.append("apiKey", apiKeys.newsApi);
    
    console.log("Fetching from News API:", url.toString());
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("News API error:", errorData);
      
      if (response.status === 401) {
        toast.error("News API key is invalid. Please update your API key.");
      } else if (response.status === 429) {
        toast.error("News API rate limit exceeded. Try again later.");
      } else {
        toast.error(`News API error: ${errorData.message || response.statusText}`);
      }
      
      return { quotes: [], keywords: [], topics: [] };
    }
    
    const data = await response.json();
    console.log("News API response:", data);
    
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
export async function fetchTwitterData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    const apiKeys = getApiKeys();
    
    if (!apiKeys.twitter) {
      toast.error("Twitter API key is missing. Please add your key in the API Keys settings.");
      return { quotes: [], keywords: [], topics: [] };
    }
    
    // For this implementation, we'll use a simplified approach with Twitter API v2
    // In a production environment, you would need proper OAuth authentication
    
    // Example endpoint for recent tweets search
    const url = "https://api.twitter.com/2/tweets/search/recent";
    const searchQuery = encodeURIComponent(`${query.query} ${query.keywords.join(" ")} -is:retweet`);
    
    const params = new URLSearchParams({
      'query': searchQuery,
      'max_results': '10',
      'tweet.fields': 'created_at,public_metrics,lang',
      'expansions': 'author_id',
      'user.fields': 'name,username,profile_image_url'
    });
    
    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${apiKeys.twitter}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Twitter API error:", errorData);
      
      if (response.status === 401) {
        toast.error("Twitter API key is invalid or expired. Please update your API key.");
      } else if (response.status === 429) {
        toast.error("Twitter API rate limit exceeded. Try again later.");
      } else {
        toast.error(`Twitter API error: ${errorData.detail || response.statusText}`);
      }
      
      return { quotes: [], keywords: [], topics: [] };
    }
    
    const data = await response.json();
    console.log("Twitter API response:", data);
    
    if (data.data && data.data.length > 0) {
      // Map user information to tweets
      const userMap = data.includes?.users?.reduce((acc: any, user: any) => {
        acc[user.id] = user;
        return acc;
      }, {}) || {};
      
      // Extract quotes from tweets
      const quotes: QuoteData[] = data.data.map((tweet: any) => {
        const sentiment = detectSentiment(tweet.text);
        const user = userMap[tweet.author_id] || { username: "Unknown" };
        
        return {
          text: tweet.text,
          sentiment,
          source: `Twitter: @${user.username}`
        };
      });
      
      // Extract keywords and topics
      const allText = data.data.map((tweet: any) => tweet.text).join(" ");
      const keywords = extractKeywords(allText);
      const topics = extractTopics(allText);
      
      return { quotes, keywords, topics };
    }
    
    return { quotes: [], keywords: [], topics: [] };
  } catch (error) {
    console.error("Error fetching Twitter data:", error);
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Reddit API integration
export async function fetchRedditData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    // Reddit's API allows some access without authentication for basic searches
    const searchTerm = encodeURIComponent(`${query.query} ${query.keywords.join(" ")}`);
    const url = `https://www.reddit.com/search.json?q=${searchTerm}&sort=relevance&limit=15`;
    
    console.log("Fetching from Reddit API:", url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PersonaAI/1.0'
      }
    });
    
    if (!response.ok) {
      console.error("Reddit API error:", response.statusText);
      toast.error(`Reddit API error: ${response.statusText}`);
      return { quotes: [], keywords: [], topics: [] };
    }
    
    const data = await response.json();
    console.log("Reddit API response received");
    
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
