
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { getApiKey, saveApiKey, clearApiKeys } from "@/services/utils/apiKeyUtils";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { validateApiKey } from "@/services/ai/textToSpeechService";

interface ApiKeyManagerProps {
  onApiKeyUpdate: (apiKey: string | null) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyUpdate }) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Check if API key exists on mount
  useEffect(() => {
    const checkApiKey = async () => {
      const storedApiKey = getApiKey("openai");
      if (storedApiKey) {
        setApiKey(storedApiKey);
        
        // Validate the stored API key
        setIsValidating(true);
        try {
          const isValid = await validateApiKey(storedApiKey);
          setIsApiKeyValid(isValid);
          if (isValid) {
            onApiKeyUpdate(storedApiKey);
            toast.success("API Key validated successfully");
          } else {
            toast.error("Stored API Key is invalid. Please enter a new one.");
          }
        } catch (error) {
          console.error("API key validation error:", error);
          toast.error("Failed to validate API Key");
        } finally {
          setIsValidating(false);
        }
      }
    };
    
    checkApiKey();
  }, [onApiKeyUpdate]);

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      toast.error("API Key cannot be empty.");
      return;
    }
    
    setIsValidating(true);
    try {
      // Validate the API key
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        saveApiKey("openai", apiKey);
        setIsApiKeyValid(true);
        onApiKeyUpdate(apiKey);
        toast.success("API Key saved and validated successfully!");
      } else {
        toast.error("Invalid API Key. Please check and try again.");
      }
    } catch (error) {
      console.error("API key validation error:", error);
      toast.error("Failed to validate API Key. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearApiKey = () => {
    clearApiKeys();
    setApiKey("");
    setIsApiKeyValid(false);
    onApiKeyUpdate(null);
    toast.success("API Key cleared successfully!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="password"
          placeholder="Enter your API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isApiKeyValid || isValidating}
        />
        <Button 
          onClick={handleSaveApiKey} 
          disabled={isApiKeyValid || isValidating}
        >
          {isValidating ? "Validating..." : "Save API Key"}
        </Button>
      </div>
      {isApiKeyValid && (
        <div className="text-green-500">API Key is valid.</div>
      )}
      <Button variant="destructive" onClick={handleClearApiKey}>
        Clear API Key
      </Button>
    </div>
  );
};

export default ApiKeyManager;
