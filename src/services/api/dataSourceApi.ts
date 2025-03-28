import { ResearchQuery, QuoteData } from "../types/qualitativeAnalysisTypes";
import { getApiKeys } from "../utils/apiKeyUtils";
import { detectSentiment } from "../utils/sentimentUtils";
import { extractKeywords, extractTopics, getDateFromTimeFrame } from "../utils/textAnalysisUtils";
import { toast } from "sonner";

// News API integration
export async function fetchNewsData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    // Use the provided API key
    const newsApiKey = "fd3f81fca8ee4433b1400b634aee7d2e";
    
    // Convert timeframe to date range for News API
    const from = getDateFromTimeFrame(query.timeFrame);
    
    // Build News API URL
    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.append("q", `${query.query} ${query.keywords.join(" ")}`);
    url.searchParams.append("from", from);
    url.searchParams.append("sortBy", "relevancy");
    url.searchParams.append("language", "en");
    url.searchParams.append("pageSize", "25");
    url.searchParams.append("apiKey", newsApiKey);
    
    console.log("Fetching news data with URL:", url.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("News API error:", errorData);
      
      if (response.status === 401) {
        toast.error("News API key is invalid or missing. Please update your API key.");
      } else if (response.status === 429) {
        toast.error("News API rate limit exceeded. Try again later or use a different API key.");
      } else {
        toast.error(`News API error: ${errorData.message || response.statusText}`);
      }
      
      return { quotes: [], keywords: [], topics: [] };
    }
    
    const data = await response.json();
    console.log("News API response:", data);
    
    if (data.articles && data.articles.length > 0) {
      // Extract quotes from articles
      const quotes: QuoteData[] = data.articles.slice(0, 10).map((article: any) => {
        // Simple sentiment detection based on title and description
        const sentiment = detectSentiment(article.title + " " + (article.description || ""));
        
        return {
          text: article.description || article.title,
          sentiment,
          source: "News: " + article.source.name,
          date: article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
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
    toast.error("Failed to fetch news data. Please try again later.");
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Placeholder functions for Twitter and Reddit (not used but keeping them for future)
export async function fetchTwitterData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  // Not implementing Twitter API for now
  return { 
    quotes: [{
      text: "Twitter API is not available in this version.",
      sentiment: "neutral",
      source: "Twitter",
      date: new Date().toISOString().split('T')[0]
    }], 
    keywords: [], 
    topics: [] 
  };
}

export async function fetchRedditData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  // Not implementing Reddit API for now
  return { 
    quotes: [{
      text: "Reddit API is not available in this version.",
      sentiment: "neutral",
      source: "Reddit",
      date: new Date().toISOString().split('T')[0]
    }], 
    keywords: [], 
    topics: [] 
  };
}
