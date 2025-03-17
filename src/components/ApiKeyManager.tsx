
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { getApiKey, saveApiKey, clearApiKeys } from "@/services/utils/apiKeyUtils";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { validateApiKey } from "@/services/ai/textToSpeechService";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface ApiKeyManagerProps {
  onApiKeyUpdate: (apiKey: string | null) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyUpdate }) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>("");

  // Check if API key exists on mount
  useEffect(() => {
    const checkApiKey = async () => {
      const storedApiKey = getApiKey("openai");
      if (storedApiKey) {
        setApiKey(storedApiKey);
        
        // Validate the stored API key
        setIsValidating(true);
        setValidationMessage("Validating stored API key...");
        try {
          const isValid = await validateApiKey(storedApiKey);
          setIsApiKeyValid(isValid);
          if (isValid) {
            setValidationMessage("API Key is valid");
            onApiKeyUpdate(storedApiKey);
            toast.success("API Key validated successfully");
          } else {
            setValidationMessage("Stored API Key is invalid. Please enter a new one.");
            toast.error("Stored API Key is invalid. Please enter a new one.");
          }
        } catch (error) {
          console.error("API key validation error:", error);
          setValidationMessage("Failed to validate API Key. Please try again.");
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
    
    if (!apiKey.startsWith('sk-')) {
      toast.error("API Key should start with 'sk-'. Please check your OpenAI API key.");
      setValidationMessage("Invalid API Key format. It should start with 'sk-'.");
      return;
    }
    
    setIsValidating(true);
    setValidationMessage("Validating API key...");
    try {
      // Validate the API key
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        saveApiKey("openai", apiKey);
        setIsApiKeyValid(true);
        setValidationMessage("API Key is valid");
        onApiKeyUpdate(apiKey);
        toast.success("API Key saved and validated successfully!");
      } else {
        setValidationMessage("Invalid API Key. Please check and try again.");
        toast.error("Invalid API Key. Please check and try again.");
      }
    } catch (error) {
      console.error("API key validation error:", error);
      setValidationMessage("Failed to validate API Key. Please try again.");
      toast.error("Failed to validate API Key. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearApiKey = () => {
    clearApiKeys();
    setApiKey("");
    setIsApiKeyValid(false);
    setValidationMessage("");
    onApiKeyUpdate(null);
    toast.success("API Key cleared successfully!");
  };

  const isStructurallyValidKey = apiKey.startsWith('sk-') && apiKey.length > 10;

  return (
    <div className="space-y-4">
      <Alert className="bg-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          You need an OpenAI API key with access to speech models (tts-1 and whisper-1) and GPT-4o Mini.
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center space-x-2">
        <Input
          type="password"
          placeholder="Enter your OpenAI API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isApiKeyValid || isValidating}
          className={isStructurallyValidKey ? "border-green-400" : ""}
        />
        <Button 
          onClick={handleSaveApiKey} 
          disabled={isApiKeyValid || isValidating || !apiKey}
        >
          {isValidating ? "Validating..." : "Save API Key"}
        </Button>
      </div>
      
      {validationMessage && (
        <div className={`flex items-center ${isApiKeyValid ? "text-green-500" : "text-amber-500"}`}>
          {isApiKeyValid ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2" />
          )}
          {validationMessage}
        </div>
      )}
      
      <div className="text-sm text-gray-400 mt-1">
        Your API key should start with "sk-" and must have access to OpenAI's audio and chat models.
      </div>
      
      {isApiKeyValid && (
        <Button variant="destructive" onClick={handleClearApiKey}>
          Clear API Key
        </Button>
      )}
    </div>
  );
};

export default ApiKeyManager;
