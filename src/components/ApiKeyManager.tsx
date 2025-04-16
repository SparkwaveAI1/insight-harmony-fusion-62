
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { validateApiKey } from "@/services/ai/textToSpeechService";
import { AlertCircle, CheckCircle2, Info, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface ApiKeyManagerProps {
  onApiKeyUpdate: (apiKey: string | null) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyUpdate }) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [validationAttempts, setValidationAttempts] = useState<number>(0);
  const [validationDetails, setValidationDetails] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check user authentication and API key on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking authentication:", error);
        return;
      }
      
      setIsAuthenticated(!!data.session);
      
      if (data.session) {
        // Check if the user has a stored API key
        const { data: apiKeyData, error: apiKeyError } = await supabase
          .from('user_api_keys')
          .select('key_present')
          .single();
          
        if (apiKeyError && apiKeyError.code !== 'PGRST116') {
          console.error("Error fetching API key status:", apiKeyError);
          return;
        }
        
        if (apiKeyData?.key_present) {
          setApiKey("••••••••••••••••••••••••••••");
          setIsApiKeyValid(true);
          setValidationMessage("API Key is valid and securely stored");
          onApiKeyUpdate("stored-key");
          toast.success("Using your stored API key");
        }
      }
    };
    
    checkAuthentication();
  }, [onApiKeyUpdate]);
  
  // Watch for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      toast.error("API Key cannot be empty.");
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      toast.error("API Key should start with 'sk-'. Please check your OpenAI API key.");
      setValidationMessage("Invalid API Key format. It should start with 'sk-'.");
      setValidationDetails("OpenAI API keys typically start with 'sk-' followed by a long string of characters. Make sure you're using the correct format from your OpenAI account.");
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("You must be logged in to save an API key");
      setValidationMessage("Authentication required to save API keys");
      setValidationDetails("For security, we require you to be logged in before saving API keys. This allows us to store your key securely.");
      return;
    }
    
    setIsValidating(true);
    setValidationMessage("Validating API key...");
    try {
      console.log("API KEY MANAGER: Attempting to validate new API key...");
      // Validate the API key
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        // Store the API key in Supabase
        const { error: storeError } = await supabase.functions.invoke('store-api-key', {
          body: { apiKey, service: 'openai' }
        });
        
        if (storeError) {
          console.error("Error storing API key:", storeError);
          toast.error("Failed to securely store API key");
          return;
        }
        
        setIsApiKeyValid(true);
        setValidationMessage("API Key is valid and securely stored");
        setValidationDetails("Your API key has been validated and securely stored in our database. It is encrypted and only accessible when you are authenticated.");
        onApiKeyUpdate("stored-key");
        
        // Mask the key for display
        setApiKey("••••••••••••••••••••••••••••");
        
        toast.success("API Key saved and validated successfully!");
        console.log("API KEY MANAGER: API key saved and validated successfully");
      } else {
        setValidationMessage("Invalid API Key. Please check and try again.");
        setValidationDetails("Your API key failed validation. This might be because the key is invalid, expired, or doesn't have access to the required models (whisper-1, tts-1, gpt-4o-mini).");
        toast.error("Invalid API Key. Please check and try again.");
        console.error("API KEY MANAGER: API key validation failed");
      }
    } catch (error) {
      console.error("API KEY MANAGER: API key validation error:", error);
      setValidationMessage("Failed to validate API Key. Network error.");
      setValidationDetails("A network error occurred during API key validation. Please check your internet connection and try again.");
      toast.error("Failed to validate API Key. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearApiKey = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to remove an API key");
      return;
    }
    
    try {
      const { error } = await supabase.functions.invoke('remove-api-key', {
        body: { service: 'openai' }
      });
      
      if (error) {
        console.error("Error removing API key:", error);
        toast.error("Failed to remove API key");
        return;
      }
      
      setApiKey("");
      setIsApiKeyValid(false);
      setValidationMessage("");
      setValidationDetails("");
      onApiKeyUpdate(null);
      toast.success("API Key removed successfully!");
    } catch (error) {
      console.error("Error removing API key:", error);
      toast.error("Failed to remove API key");
    }
  };

  const retryValidation = () => {
    setValidationAttempts(prev => prev + 1);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const isStructurallyValidKey = apiKey.startsWith('sk-') && apiKey.length > 10;

  // If not authenticated, show a login prompt
  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            You need to be logged in to securely store API keys. This ensures your keys are encrypted and only accessible to you.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => { /* Handle login - redirect to login page or open auth dialog */ }}
          className="w-full"
        >
          Log in to manage API keys
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          You need an OpenAI API key with access to speech models (tts-1 and whisper-1) and GPT-4o Mini.
          Your key will be securely encrypted and stored.
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center space-x-2">
        <Input
          type="password"
          placeholder={isApiKeyValid ? "API Key securely stored" : "Enter your OpenAI API Key"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isApiKeyValid || isValidating}
          className={isStructurallyValidKey ? "border-green-400" : ""}
        />
        <Button 
          onClick={handleSaveApiKey} 
          disabled={isApiKeyValid || isValidating || !apiKey || (apiKey === "••••••••••••••••••••••••••••")}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : "Save API Key"}
        </Button>
      </div>
      
      {validationMessage && (
        <div className="space-y-2">
          <div className={`flex items-center justify-between ${isApiKeyValid ? "text-green-500" : "text-amber-500"}`}>
            <div className="flex items-center">
              {isApiKeyValid ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : isValidating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {validationMessage}
            </div>
            
            <div className="flex items-center space-x-2">
              {!isApiKeyValid && !isValidating && validationMessage.includes("Failed") && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={retryValidation} 
                  className="text-xs"
                >
                  Retry
                </Button>
              )}
              
              {validationDetails && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleDetails} 
                  className="text-xs"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </Button>
              )}
            </div>
          </div>
          
          {showDetails && validationDetails && (
            <Alert className={isApiKeyValid ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {validationDetails}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      <div className="text-sm text-gray-400 mt-1">
        Your API key is stored securely with encryption and is only accessible when you're logged in.
      </div>
      
      {isApiKeyValid && (
        <Button variant="destructive" onClick={handleClearApiKey}>
          Remove API Key
        </Button>
      )}
    </div>
  );
};

export default ApiKeyManager;
