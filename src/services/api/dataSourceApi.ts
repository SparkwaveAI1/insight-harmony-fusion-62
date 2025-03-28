import { ResearchQuery, QuoteData } from "../types/qualitativeAnalysisTypes";
import { getApiKeys } from "../utils/apiKeyUtils";
import { detectSentiment } from "../utils/sentimentUtils";
import { extractKeywords, extractTopics, getDateFromTimeFrame } from "../utils/textAnalysisUtils";
import { toast } from "sonner";
import { showApiRestrictionNotice } from "../utils/apiUtils";

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
    
    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("News API error:", errorData);
        
        if (response.status === 401) {
          toast.error("News API key is invalid or missing. Please update your API key.");
        } else if (response.status === 429) {
          toast.error("News API rate limit exceeded. Try again later or use a different API key.");
        } else if (errorData && errorData.code === "corsNotAllowed") {
          // Handle CORS restriction specifically
          showApiRestrictionNotice("News API");
          return generateFallbackNewsData(query);
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
      console.error("News API fetch error:", error);
      
      // Check if the error is CORS-related
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        console.log("CORS issue detected with News API");
        showApiRestrictionNotice("News API");
        return generateFallbackNewsData(query);
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Error fetching news data:", error);
    toast.error("Failed to fetch news data. Please try again later.");
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Generate fallback data for News API when CORS restrictions prevent direct access
function generateFallbackNewsData(query: ResearchQuery): { quotes: QuoteData[], keywords: string[], topics: string[] } {
  const currentDate = new Date().toISOString().split('T')[0];
  const searchTerms = query.query.toLowerCase();
  
  // Create synthetic articles based on query terms
  const quotes: QuoteData[] = [
    {
      text: `Recent discussions about ${query.query} have shown increased interest across multiple sectors.`,
      sentiment: "positive",
      source: "News: Simulated Data (CORS Restriction)",
      date: currentDate
    },
    {
      text: `Analysts remain divided on the implications of ${query.query} for long-term market stability.`,
      sentiment: "neutral",
      source: "News: Simulated Data (CORS Restriction)",
      date: currentDate
    },
    {
      text: `Concerns have been raised regarding potential negative effects of ${query.query} on international relations.`,
      sentiment: "negative",
      source: "News: Simulated Data (CORS Restriction)",
      date: currentDate
    }
  ];
  
  // Generate plausible keywords from the query
  const queryWords = query.query.split(/\s+/);
  const keywords = [...queryWords, ...query.keywords].filter(Boolean);
  
  // Generate plausible topics
  const topics = ["Economic Impact", "Political Discussion", "Social Implications", "Global Trends", "Market Analysis"];
  
  toast.info("Using simulated news data due to API restrictions", {
    description: "The News API has CORS restrictions in browser environments",
    duration: 5000
  });
  
  return { quotes, keywords, topics };
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
