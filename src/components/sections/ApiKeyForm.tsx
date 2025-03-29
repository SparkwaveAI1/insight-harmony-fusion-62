
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

const ApiKeyForm = () => {
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Note: This function is for demonstration purposes only.
  // In a real-world app, you would need proper authentication and server-side logic to update Edge Function secrets.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Simulate a submission process
    setTimeout(() => {
      toast.info("Configuration would need server-side implementation", {
        description: "In a production environment, you would need to implement server-side logic to update the Edge Function secret."
      });
      toast.warning("To set up the API key", {
        description: "Go to your Supabase project dashboard, navigate to Edge Functions, and add NEWS_API_KEY to your secrets."
      });
      setIsSubmitting(false);
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
                      In a real application, this form would securely add the API key to your Supabase Edge Function secrets.
                      For security reasons, this demo does not actually set the key.
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
      </CardContent>
      
      <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
        <p>Get your API key at <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="underline">newsapi.org</a></p>
        <p className="mt-1">To manually configure the key, go to your Supabase project dashboard → Edge Functions → newsapi-proxy → Secrets</p>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;
