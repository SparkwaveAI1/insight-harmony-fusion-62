import { ResearchQuery, QuoteData } from "../types/qualitativeAnalysisTypes";
import { getApiKeys } from "../utils/apiKeyUtils";
import { detectSentiment } from "../utils/sentimentUtils";
import { extractKeywords, extractTopics, getDateFromTimeFrame } from "../utils/textAnalysisUtils";
import { toast } from "sonner";
import { showApiRestrictionNotice, generatePlaceholderData, handleApiError } from "../utils/apiUtils";
import { supabase } from "@/integrations/supabase/client";

// News API integration using Supabase Edge Function as a proxy
export async function fetchNewsData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    // Store the API key for potential backend usage
    const newsApiKey = "fd3f81fca8ee4433b1400b634aee7d2e";
    
    // Convert timeframe to date range for News API
    const from = getDateFromTimeFrame(query.timeFrame);
    
    console.log("Using Supabase Edge Function for News API request");
    
    // Build the params for the Edge Function
    const params = new URLSearchParams();
    params.append("q", `${query.query} ${query.keywords.join(" ")}`);
    if (from) params.append("from", from);
    params.append("sortBy", "relevancy");
    params.append("language", "en");
    params.append("pageSize", "25");
    
    try {
      // Call the Supabase Edge Function with the correct params format
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "newsapi-proxy",
        {
          method: "GET",
          headers: { 
            "Content-Type": "application/json" 
          },
          // Fix: Change queryParams to query which is the correct property name
          query: Object.fromEntries(params)
        }
      );
      
      if (functionError) {
        console.error("Supabase Edge Function error:", functionError);
        toast.error("Error calling News API via Supabase", {
          description: functionError.message || "Check the console for details",
        });
        
        // Fallback to simulated data
        return generateFallbackNewsData(query);
      }
      
      console.log("Edge Function response:", functionData);
      
      // Process the response data
      if (functionData.articles && functionData.articles.length > 0) {
        // Extract quotes from articles
        const quotes: QuoteData[] = functionData.articles.slice(0, 10).map((article: any) => {
          const sentiment = detectSentiment(article.title + " " + (article.description || ""));
          
          return {
            text: article.description || article.title,
            sentiment,
            source: "News: " + article.source.name,
            date: article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          };
        });
        
        // Extract keywords from titles
        const keywords = extractKeywords(functionData.articles.map((a: any) => a.title).join(" "));
        
        // Extract potential topics
        const topics = extractTopics(functionData.articles.map((a: any) => a.title + " " + (a.description || "")).join(" "));
        
        return { quotes, keywords, topics };
      }
      
      toast.warning("No articles found matching your search criteria", {
        description: "Try broadening your search terms or timeframe",
      });
      
      return { quotes: [], keywords: [], topics: [] };
    } catch (error) {
      console.error("Error invoking Supabase Edge Function:", error);
      toast.error("Error connecting to Supabase Edge Function", {
        description: "Falling back to simulated data",
      });
      
      return generateFallbackNewsData(query);
    }
  } catch (error) {
    handleApiError(error, "News API");
    return generateFallbackNewsData(query);
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
    description: "Deploy the Edge Function for real data access",
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
