
// This file only needs to be updated to make sure it has consistent exported functions
// We need to check if we have a hasApiKey function and make sure clearApiKey is properly exported as clearApiKeys
// or vice versa

const storagePrefix = "prsna_api_";

export const setApiKey = (service: string, apiKey: string): void => {
  localStorage.setItem(`${storagePrefix}${service}`, apiKey);
};

export const getApiKey = (service: string): string | null => {
  return localStorage.getItem(`${storagePrefix}${service}`);
};

export const clearApiKey = (service: string): void => {
  localStorage.removeItem(`${storagePrefix}${service}`);
};

export const clearApiKeys = (): void => {
  // Clear all API keys from localStorage
  Object.keys(localStorage)
    .filter(key => key.startsWith(storagePrefix))
    .forEach(key => localStorage.removeItem(key));
};

export const hasApiKey = (service: string): boolean => {
  const key = getApiKey(service);
  return key !== null && key.trim() !== "";
};

export const hasAnyApiKey = (): boolean => {
  return Object.keys(localStorage)
    .filter(key => key.startsWith(storagePrefix))
    .some(key => localStorage.getItem(key) !== null && localStorage.getItem(key)!.trim() !== "");
};
