
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchQualitativeData } from "@/services/api/dataSourceService";
import { ResearchQuery, AnalysisResults } from "@/services/types/qualitativeAnalysisTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const InsightsGenerator = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState<"checking" | "available" | "unavailable" | "error">("checking");
  const [lastPolledTime, setLastPolledTime] = useState<Date | null>(null);
  
  // Function to check if Edge Function is available
  const checkEdgeFunction = async () => {
    try {
      setEdgeFunctionStatus("checking");
      
      console.log("Checking if newsapi-proxy Edge Function is available...");
      // Using GET method instead of OPTIONS since OPTIONS is not supported by the invoke method
      const { data, error } = await supabase.functions.invoke("newsapi-proxy", {
        method: "GET"
      });
      
      if (error) {
        console.warn("Edge Function check error:", error);
        setEdgeFunctionStatus("unavailable");
        toast.error("Edge Function is not available", {
          description: "Please make sure the newsapi-proxy function is deployed",
          duration: 5000
        });
      } else {
        console.log("Edge Function is available:", data);
        setEdgeFunctionStatus("available");
        toast.success("Edge Function is available", {
          description: "Ready to fetch real news data",
          duration: 3000
        });
      }
      
      setLastPolledTime(new Date());
    } catch (err) {
      console.error("Error checking Edge Function:", err);
      setEdgeFunctionStatus("error");
      toast.error("Error checking Edge Function", {
        description: "An unexpected error occurred",
        duration: 5000
      });
    }
  };
  
  useEffect(() => {
    checkEdgeFunction();
    
    // Poll the edge function status every 60 seconds
    const interval = setInterval(() => {
      checkEdgeFunction();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const generateInsights = async () => {
    if (!query.trim()) {
      toast.error("Please enter a research query");
      return;
    }
    
    // Check if edge function is available before proceeding
    if (edgeFunctionStatus !== "available") {
      const proceed = window.confirm(
        "The Edge Function appears to be unavailable, which may result in no data. Would you still like to proceed?"
      );
      
      if (!proceed) {
        return;
      }
    }
    
    setIsLoading(true);
    setResults(null); // Clear any previous results
    
    try {
      console.log("Starting insight generation process for query:", query);
      
      const researchQuery: ResearchQuery = {
        query: query,
        sources: ["news"], // Focus on News API for now
        sentiment: "all",
        timeFrame: "medium-term",
        keywords: []
      };
      
      console.log("Research query parameters:", researchQuery);
      
      const data = await fetchQualitativeData(researchQuery);
      console.log("Insights generation returned data:", data);
      
      setResults(data);
      
      if (data) {
        toast.success("Insights generated successfully!");
      } else {
        toast.info("No data available for this query", {
          description: "Try a different search term or check the Edge Function deployment",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate insights", {
        description: "Please try again or check the console for details"
      });
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            AI That Thinks Like a Human, But Works at Machine Speed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter any topic to generate AI-powered analysis from social media, news, and forums in seconds.
          </p>
        </div>
        
        {edgeFunctionStatus === "available" ? (
          <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Edge Function Deployed</AlertTitle>
            <AlertDescription>
              The "newsapi-proxy" Edge Function is active and ready to fetch real-time news data.
              {lastPolledTime && (
                <span className="text-xs block mt-1">
                  Last checked: {lastPolledTime.toLocaleTimeString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        ) : edgeFunctionStatus === "unavailable" ? (
          <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle>Edge Function Not Available</AlertTitle>
            <AlertDescription>
              The "newsapi-proxy" Edge Function could not be reached. No data will be available.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 h-7 px-2 text-xs" 
                onClick={checkEdgeFunction}
              >
                Check Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : edgeFunctionStatus === "error" ? (
          <Alert className="mb-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Error Checking Edge Function</AlertTitle>
            <AlertDescription>
              An error occurred while checking the Edge Function status.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 h-7 px-2 text-xs" 
                onClick={checkEdgeFunction}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle>Checking Edge Function Status</AlertTitle>
            <AlertDescription>
              Verifying connection to the "newsapi-proxy" Edge Function...
            </AlertDescription>
          </Alert>
        )}
        
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-2 mb-8">
            <Input
              placeholder="E.g., AI tokens fear and regulation, Zelenskyy administration strategy..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={generateInsights} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Insights"}
            </Button>
          </div>
          
          {isLoading ? (
            <InsightsLoadingState />
          ) : results ? (
            <InsightsResults results={results} />
          ) : (
            <EmptyState edgeFunctionStatus={edgeFunctionStatus} />
          )}
        </div>
      </div>
    </section>
  );
};

const EmptyState = ({ edgeFunctionStatus }: { edgeFunctionStatus: string }) => (
  <Card className="border-dashed border-2 bg-transparent">
    <CardContent className="pt-6 text-center py-16">
      <p className="text-muted-foreground mb-4">
        Enter a query above and click "Generate Insights" to see AI-powered analysis
      </p>
      
      {edgeFunctionStatus !== "available" && (
        <Alert className="mt-4 bg-amber-50/50 border-amber-200 dark:bg-amber-900/10">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-sm">Edge Function Status: {edgeFunctionStatus}</AlertTitle>
          <AlertDescription className="text-xs">
            The Edge Function may not be properly deployed. Results may be limited.
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
);

const InsightsLoadingState = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
    <Skeleton className="h-48 w-full" />
  </div>
);

const InsightsResults = ({ results }: { results: AnalysisResults }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="quotes">Example Quotes</TabsTrigger>
        <TabsTrigger value="trends">Trends Analysis</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>AI-generated analysis based on collected data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.aiInsights && results.aiInsights.length > 0 ? (
                results.aiInsights.map((insight, index) => (
                  <p key={index} className="text-sm">• {insight}</p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No insights available for this query.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Topics</CardTitle>
            </CardHeader>
            <CardContent>
              {results.topTopics && results.topTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {results.topTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No topics identified for this query.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {results.sentimentBreakdown.positive > 0 || 
               results.sentimentBreakdown.neutral > 0 || 
               results.sentimentBreakdown.negative > 0 ? (
                <>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${results.sentimentBreakdown.positive}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {results.sentimentBreakdown.positive}% Positive
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-gray-400 h-2.5 rounded-full" 
                        style={{ width: `${results.sentimentBreakdown.neutral}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {results.sentimentBreakdown.neutral}% Neutral
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-red-500 h-2.5 rounded-full" 
                        style={{ width: `${results.sentimentBreakdown.negative}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {results.sentimentBreakdown.negative}% Negative
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No sentiment data available for this query.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="quotes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Example Quotes</CardTitle>
            <CardDescription>Key quotes from various sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.exampleQuotes && results.exampleQuotes.length > 0 ? (
                results.exampleQuotes.map((quote, index) => (
                  <Card key={index} className={`border-l-4 ${
                    quote.sentiment === 'positive' ? 'border-l-green-500' :
                    quote.sentiment === 'negative' ? 'border-l-red-500' : 'border-l-gray-500'
                  }`}>
                    <CardContent className="py-4">
                      <p className="italic text-sm mb-2">"{quote.text}"</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{quote.source}</span>
                        <Badge variant={
                          quote.sentiment === 'positive' ? 'default' :
                          quote.sentiment === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {quote.sentiment.charAt(0).toUpperCase() + quote.sentiment.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No quotes found for this query.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="trends" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Trends Analysis</CardTitle>
            <CardDescription>Detailed analysis of identified trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.trendsAnalysis && results.trendsAnalysis.length > 0 ? (
                results.trendsAnalysis.map((trend, index) => (
                  <div key={index} className="whitespace-pre-line text-sm">{trend}</div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No trend analysis available for this query.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default InsightsGenerator;
