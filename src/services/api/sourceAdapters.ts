
import { ResearchQuery, QuoteData, SentimentFilter } from "../types/qualitativeAnalysisTypes";
import { getApiKeys } from "../utils/apiKeyUtils";
import { toast } from "sonner";
import { handleApiError, showApiRestrictionNotice, generatePlaceholderData } from "../utils/apiUtils";

// Twitter API adapter
export async function fetchTwitterData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    const apiKeys = getApiKeys();
    
    if (!apiKeys.twitter) {
      toast.error("Twitter API key is missing. Please add your key in the API Keys settings.");
      return { quotes: [], keywords: [], topics: [] };
    }
    
    showApiRestrictionNotice("Twitter");
    return generatePlaceholderData("Twitter");
  } catch (error) {
    handleApiError(error, "Twitter API");
    return { quotes: [], keywords: [], topics: [] };
  }
}

// Reddit API adapter
export async function fetchRedditData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    showApiRestrictionNotice("Reddit");
    return generatePlaceholderData("Reddit");
  } catch (error) {
    handleApiError(error, "Reddit API");
    return { quotes: [], keywords: [], topics: [] };
  }
}

// News API adapter
export async function fetchNewsData(query: ResearchQuery): Promise<{ quotes: QuoteData[], keywords: string[], topics: string[] }> {
  try {
    const apiKeys = getApiKeys();
    
    if (!apiKeys.newsApi) {
      toast.error("News API key is missing. Please add your key in the API Keys settings.");
      return { quotes: [], keywords: [], topics: [] };
    }
    
    showApiRestrictionNotice("News API");
    return generatePlaceholderData("News API");
  } catch (error) {
    handleApiError(error, "News API");
    return { quotes: [], keywords: [], topics: [] };
  }
}
