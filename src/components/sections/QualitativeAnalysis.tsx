
import React, { useState, useEffect } from "react";
import Section from "../ui-custom/Section";
import Logo from "../ui-custom/Logo";
import { toast } from "sonner";
import { ResearchQuery, AnalysisResults } from "@/services/types/qualitativeAnalysisTypes";
import { fetchQualitativeData } from "@/services/api/qualitativeDataService";
import { supabase } from "@/integrations/supabase/client";
import QueryForm from "./qualitative-analysis/QueryForm";
import ResultsDashboard from "./qualitative-analysis/ResultsDashboard";
import Reveal from "../ui-custom/Reveal";

const QualitativeAnalysis: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [query, setQuery] = useState<ResearchQuery>({
    query: "",
    sources: ["twitter", "reddit", "news"],
    sentiment: "all",
    timeFrame: "medium-term",
    keywords: []
  });
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState<"checking" | "available" | "available-no-key" | "unavailable" | "error">("checking");
  const [lastPolledTime, setLastPolledTime] = useState<Date | null>(null);
  
  const checkEdgeFunction = async () => {
    try {
      setEdgeFunctionStatus("checking");
      
      console.log("Checking if newsapi-proxy Edge Function is available...");
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
        
        if (data.apiKeyStatus === "missing") {
          setEdgeFunctionStatus("available-no-key");
          toast.warning("Edge Function is available but API key is missing", {
            description: "Please configure the NEWS_API_KEY in the Edge Function secrets",
            duration: 5000
          });
        } else {
          setEdgeFunctionStatus("available");
          toast.success("Edge Function is available", {
            description: "Ready to fetch real news data",
            duration: 3000
          });
        }
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
    const interval = setInterval(() => {
      checkEdgeFunction();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    console.log("Submitting query:", query);
    
    setIsLoading(true);
    try {
      const data = await fetchQualitativeData(query);
      console.log("Analysis data received:", data);
      setResults(data);
      setShowResults(true);
      toast.success("Analysis completed successfully");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch analysis data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setShowResults(false);
  };

  return (
    <Section className="bg-gradient-to-b from-primary/5 to-background py-20" highlight={true}>
      <div className="container max-w-5xl mx-auto">
        <Reveal>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4 justify-center">
                <Logo size="lg" />
                <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                  Qualitative Insights Conductor
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-3 text-[#221F26] font-plasmik">
                AI That Thinks Like a Human<br />
                Not a Machine
              </h2>
              <p className="text-muted-foreground text-lg">
                Uncover the real thoughts, opinions, and emotions driving conversations—beyond data, beyond numbers.
              </p>
            </div>
          </div>
        </Reveal>

        {!showResults ? (
          <Reveal delay={200}>
            <Card className="shadow-lg mb-8 border-primary/20">
              <QueryForm 
                query={query}
                setQuery={setQuery}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                edgeFunctionStatus={edgeFunctionStatus}
                lastPolledTime={lastPolledTime}
                onCheckEdgeFunction={checkEdgeFunction}
              />
            </Card>
          </Reveal>
        ) : (
          <ResultsDashboard 
            results={results!} 
            query={query} 
            onNewSearch={handleNewSearch} 
          />
        )}
      </div>
    </Section>
  );
};

export default QualitativeAnalysis;
