
import { toast } from "sonner";
import { QuoteData, SentimentFilter } from "../types/qualitativeAnalysisTypes";

// Centralized error handling for API calls
export const handleApiError = (error: unknown, service: string): void => {
  console.error(`Error in ${service}:`, error);
  toast.error(`${service} error occurred`, {
    description: "Using fallback data for this request.",
    duration: 3000
  });
};

// Centralized API notification for CORS/proxy issues
export const showApiRestrictionNotice = (apiName: string): void => {
  console.log(`${apiName} API has CORS restrictions in browser environment`);
  toast.warning(`${apiName} API requires a backend proxy for browser requests`, {
    description: "Using Supabase Edge Function to proxy API requests",
    duration: 5000,
    id: `${apiName.toLowerCase()}-api-cors-warning`
  });
};

// Edge Function success notification
export const showEdgeFunctionSuccess = (): void => {
  toast.success("Edge Function deployed successfully", {
    description: "The 'newsapi-proxy' Edge Function is now handling API requests",
    duration: 5000,
    id: "edge-function-success-notice"
  });
};

// Placeholder data generator for when APIs are inaccessible
export const generatePlaceholderData = (apiName: string) => {
  return {
    quotes: [{ 
      text: `${apiName} API has CORS restrictions in this environment. Using simulated data instead.`, 
      sentiment: "neutral" as SentimentFilter, 
      source: `${apiName}: System Notice`,
      date: new Date().toISOString().split('T')[0]
    }],
    keywords: ["CORS", "API", apiName, "restrictions", "browser"],
    topics: ["API Access Limitations"]
  };
};
