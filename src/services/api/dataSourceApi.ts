
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
        
        return { quotes: [], keywords: [], topics: [] };
      }
      
      console.log("Edge Function response:", functionData);
      
      // Check if response is empty or invalid
      if (!functionData) {
        console.error("Empty response from Edge Function");
        toast.error("No data received from News API", {
          description: "The API response was empty",
        });
        return { quotes: [], keywords: [], topics: [] };
      }
      
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
        
        toast.success(`Retrieved ${quotes.length} articles from News API`);
        return { quotes, keywords, topics };
      } else if (functionData.status === "error") {
        // Handle API error response
        console.error("News API returned an error:", functionData.message || "Unknown error");
        toast.error("News API error", {
          description: functionData.message || "Unknown error occurred",
        });
        return { quotes: [], keywords: [], topics: [] };
      } else {
        // API returned success but no articles
        console.warn("News API returned no articles");
        toast.warning("No articles found matching your search criteria", {
          description: "Try broadening your search terms or timeframe",
        });
        return { quotes: [], keywords: [], topics: [] };
      }
    } catch (error) {
      console.error("Error invoking Supabase Edge Function:", error);
      toast.error("Error connecting to Supabase Edge Function", {
        description: "Check connection and deployment status",
      });
      
      return { quotes: [], keywords: [], topics: [] };
    }
  } catch (error) {
    handleApiError(error, "News API");
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Placeholder functions for Twitter and Reddit (not used but keeping them for future)
export async function fetchTwitterData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    console.log("Twitter API is not implemented yet");
    toast.warning("Twitter API is not yet implemented", {
      description: "This is a placeholder for future functionality"
    });
    return { quotes: [], keywords: [], topics: [] };
  } catch (error) {
    handleApiError(error, "Twitter API");
    return { quotes: [], keywords: [], topics: [] };
  }
}

export async function fetchRedditData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    console.log("Reddit API is not implemented yet");
    toast.warning("Reddit API is not yet implemented", {
      description: "This is a placeholder for future functionality"
    });
    return { quotes: [], keywords: [], topics: [] };
  } catch (error) {
    handleApiError(error, "Reddit API");
    return { quotes: [], keywords: [], topics: [] };
  }
}
