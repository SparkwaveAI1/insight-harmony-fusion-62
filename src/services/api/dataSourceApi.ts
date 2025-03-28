import { ResearchQuery, QuoteData } from "../types/qualitativeAnalysisTypes";
import { getApiKeys } from "../utils/apiKeyUtils";
import { detectSentiment } from "../utils/sentimentUtils";
import { extractKeywords, extractTopics, getDateFromTimeFrame } from "../utils/textAnalysisUtils";
import { toast } from "sonner";
import { handleApiError } from "../utils/apiUtils";
import { supabase } from "@/integrations/supabase/client";

// News API integration using Supabase Edge Function as a proxy
export async function fetchNewsData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    // Convert timeframe to date range for News API
    const from = getDateFromTimeFrame(query.timeFrame);
    
    console.log("Using Supabase Edge Function for News API request");
    
    // Format the search query properly - ensure it's not empty
    const searchQuery = `${query.query} ${query.keywords.join(" ")}`.trim();
    
    if (!searchQuery) {
      toast.error("Search query cannot be empty", {
        description: "Please provide a search term or keywords",
      });
      return { quotes: [], keywords: [], topics: [] };
    }
    
    try {
      console.log("Calling Edge Function with search query:", searchQuery);
      
      // Call the Supabase Edge Function with all necessary parameters in the body
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "newsapi-proxy",
        {
          method: "POST",
          body: {
            q: searchQuery,
            from: from || undefined,
            sortBy: "relevancy",
            language: "en",
            pageSize: "25"
          }
        }
      );
      
      if (functionError) {
        console.error("Supabase Edge Function error:", functionError);
        toast.error("Error calling News API via Supabase", {
          description: functionError.message || "Check the console for details",
        });
        
        // Return empty result instead of simulated data
        return { quotes: [], keywords: [], topics: [] };
      }
      
      console.log("Edge Function response:", functionData);
      
      // Process the response data
      if (functionData && functionData.articles && functionData.articles.length > 0) {
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
        
        toast.success(`Retrieved ${quotes.length} articles from News API`);
        return { quotes, keywords, topics };
      }
      
      // If we get here but don't have articles, it means the API returned a success response but no data
      toast.warning("No articles found matching your search criteria", {
        description: "Try broadening your search terms or timeframe",
      });
      
      return { quotes: [], keywords: [], topics: [] };
    } catch (error) {
      console.error("Error invoking Supabase Edge Function:", error);
      toast.error("Error connecting to Supabase Edge Function", {
        description: "Check connection and deployment status",
      });
      
      // Return empty result instead of simulated data
      return { quotes: [], keywords: [], topics: [] };
    }
  } catch (error) {
    handleApiError(error, "News API");
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Placeholder functions for Twitter and Reddit (not used but keeping them for future)
export async function fetchTwitterData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  // Not implementing Twitter API for now
  return { 
    quotes: [], 
    keywords: [], 
    topics: [] 
  };
}

export async function fetchRedditData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  // Not implementing Reddit API for now
  return { 
    quotes: [], 
    keywords: [], 
    topics: [] 
  };
}
