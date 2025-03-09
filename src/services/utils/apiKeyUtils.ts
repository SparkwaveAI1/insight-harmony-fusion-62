
import { toast } from "sonner";
import { STORAGE_KEYS, DEFAULT_API_KEYS } from "../types/qualitativeAnalysisTypes";

// Get API keys (user's keys if they exist, otherwise defaults)
export const getApiKeys = () => {
  return {
    newsApi: localStorage.getItem(STORAGE_KEYS.NEWS_API_KEY) || DEFAULT_API_KEYS.NEWS_API,
    twitter: localStorage.getItem(STORAGE_KEYS.TWITTER_API_KEY) || DEFAULT_API_KEYS.TWITTER,
    reddit: localStorage.getItem(STORAGE_KEYS.REDDIT_API_KEY) || DEFAULT_API_KEYS.REDDIT,
  };
};

// Save API key to localStorage
export const saveApiKey = (type: "newsApi" | "twitter" | "reddit", key: string) => {
  const storageKey = type === "newsApi" 
    ? STORAGE_KEYS.NEWS_API_KEY 
    : type === "twitter" 
      ? STORAGE_KEYS.TWITTER_API_KEY 
      : STORAGE_KEYS.REDDIT_API_KEY;
  
  localStorage.setItem(storageKey, key);
  toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} API key saved successfully`);
  return true;
};

// Clear API key from localStorage
export const clearApiKey = (type: "newsApi" | "twitter" | "reddit") => {
  const storageKey = type === "newsApi" 
    ? STORAGE_KEYS.NEWS_API_KEY 
    : type === "twitter" 
      ? STORAGE_KEYS.TWITTER_API_KEY 
      : STORAGE_KEYS.REDDIT_API_KEY;
  
  localStorage.removeItem(storageKey);
  toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} API key removed`);
  return true;
};

// Check if API key is set
export const hasApiKey = (type: "newsApi" | "twitter" | "reddit") => {
  const storageKey = type === "newsApi" 
    ? STORAGE_KEYS.NEWS_API_KEY 
    : type === "twitter" 
      ? STORAGE_KEYS.TWITTER_API_KEY 
      : STORAGE_KEYS.REDDIT_API_KEY;
  
  return !!localStorage.getItem(storageKey);
};
