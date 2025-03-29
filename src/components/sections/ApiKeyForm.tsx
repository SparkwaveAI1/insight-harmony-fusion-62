
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ApiKeyForm = () => {
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyStatus, setKeyStatus] = useState<"checking" | "available" | "unavailable" | "error">("checking");
  
  // Check if the API key is configured
  const checkApiKeyStatus = async () => {
    try {
      setKeyStatus("checking");
      
      // Call the Edge Function with a GET request to check status
      const { data, error } = await supabase.functions.invoke("newsapi-proxy", {
        method: "GET",
      });
      
      if (error) {
        console.error("Error checking Edge Function status:", error);
        setKeyStatus("error");
        return;
      }
      
      if (data && data.apiKeyStatus === "available") {
        setKeyStatus("available");
      } else {
        setKeyStatus("unavailable");
      }
    } catch (err) {
      console.error("Error in API key check:", err);
      setKeyStatus("error");
    }
  };
  
  useEffect(() => {
    checkApiKeyStatus();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    toast.info("Configuration would need server-side implementation", {
      description: "In a production environment, you would need to implement server-side logic to update the Edge Function secret."
    });
    
    toast.warning("To set up the API key manually", {
      description: "Go to your Supabase project dashboard, navigate to Edge Functions, and add NEWS_API_KEY to your secrets."
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      checkApiKeyStatus(); // Check status again after submission
    }, 1500);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configure News API Key</CardTitle>
        <CardDescription>
          Add your News API key to enable fetching data from newsapi.org
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {keyStatus === "checking" ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Checking API key status...</span>
          </div>
        ) : keyStatus === "available" ? (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">API Key Configured</h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>
                    Your News API key is properly configured in the Edge Function.
                    The application is ready to fetch real news data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="api-key" className="block text-sm font-medium mb-1">
                    News API Key
                  </label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your News API key"
                    required
                  />
                </div>
                
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Important Note</h3>
                      <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        <p>
                          {keyStatus === "unavailable" 
                            ? "The NEWS_API_KEY is not configured in your Edge Function secrets."
                            : "There was an error checking the API key status."}
                        </p>
                        <p className="mt-1">
                          To manually configure the key, go to your Supabase project dashboard → Edge Functions → newsapi-proxy → Secrets
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-4"
                disabled={isSubmitting || !apiKey}
              >
                {isSubmitting ? 'Submitting...' : 'Save API Key'}
              </Button>
            </form>
          </>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 w-full"
          onClick={checkApiKeyStatus}
        >
          Refresh API Key Status
        </Button>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
        <p className="flex items-center">
          Get your API key at 
          <a 
            href="https://newsapi.org/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ml-1 flex items-center underline"
          >
            newsapi.org <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
        </p>
        <p className="mt-1">To manually configure the key, go to your Supabase project dashboard → Edge Functions → newsapi-proxy → Secrets</p>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;
