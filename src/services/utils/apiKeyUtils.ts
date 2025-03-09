
import { DEFAULT_API_KEYS, STORAGE_KEYS } from "../types/qualitativeAnalysisTypes";

export const getApiKeys = () => {
  try {
    const storedKeys = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (storedKeys) {
      const parsedKeys = JSON.parse(storedKeys);
      return {
        OPENAI: parsedKeys.OPENAI || DEFAULT_API_KEYS.OPENAI,
        newsApi: parsedKeys.newsApi || DEFAULT_API_KEYS.newsApi,
        twitter: parsedKeys.twitter || DEFAULT_API_KEYS.twitter,
        reddit: parsedKeys.reddit || DEFAULT_API_KEYS.reddit
      };
    }
    return DEFAULT_API_KEYS;
  } catch (error) {
    console.error("Error getting API keys:", error);
    return DEFAULT_API_KEYS;
  }
};

export const saveApiKey = (keyName: string, value: string) => {
  try {
    const currentKeys = getApiKeys();
    const updatedKeys = {
      ...currentKeys,
      [keyName]: value
    };
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(updatedKeys));
    return true;
  } catch (error) {
    console.error("Error saving API key:", error);
    return false;
  }
};

// Additional utility functions as needed
export const isApiKeySet = (keyName: string): boolean => {
  const keys = getApiKeys();
  return !!keys[keyName as keyof typeof keys];
};

export const clearApiKeys = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.API_KEYS);
    return true;
  } catch (error) {
    console.error("Error clearing API keys:", error);
    return false;
  }
};
