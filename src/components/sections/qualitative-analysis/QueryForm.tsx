
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Filter, Search, Clock, Hash } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResearchQuery, DataSource, SentimentFilter, TimeFrame } from "@/services/types/qualitativeAnalysisTypes";

interface QueryFormProps {
  query: ResearchQuery;
  setQuery: (query: ResearchQuery) => void;
  onSubmit: () => void;
  isLoading: boolean;
  edgeFunctionStatus: "checking" | "available" | "available-no-key" | "unavailable" | "error";
  lastPolledTime: Date | null;
  onCheckEdgeFunction: () => void;
}

const QueryForm: React.FC<QueryFormProps> = ({
  query,
  setQuery,
  onSubmit,
  isLoading,
  edgeFunctionStatus,
  lastPolledTime,
  onCheckEdgeFunction
}) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholders = [
    "What are people saying about AI token staking incentives?",
    "How do crypto investors feel about token rewards?",
    "What's the biggest fear in the NFT space right now?",
    "What do people really think about AI-generated art?",
    "What are the most common concerns about Web3 adoption?"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query.query]);

  const handleSourceChange = (source: DataSource) => (checked: boolean) => {
    let newSources = [...query.sources];
    
    if (checked) {
      if (!newSources.includes(source)) {
        newSources.push(source);
      }
    } else {
      newSources = newSources.filter(s => s !== source);
    }
    
    if (newSources.length === 0) {
      newSources = ["twitter"];
    }
    
    setQuery({ ...query, sources: newSources });
  };

  const isSourceSelected = (source: DataSource) => {
    return query.sources.includes(source);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !query.keywords.includes(keywordInput.trim())) {
      setQuery({
        ...query,
        keywords: [...query.keywords, keywordInput.trim()]
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setQuery({
      ...query,
      keywords: query.keywords.filter(k => k !== keyword)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.query.trim()) {
      toast.error("Please enter a research query");
      return;
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Edge Function Status Alerts */}
      <EdgeFunctionStatus 
        status={edgeFunctionStatus}
        lastPolledTime={lastPolledTime}
        onCheckAgain={onCheckEdgeFunction}
      />

      {/* Query Input */}
      <div className="space-y-2">
        <label htmlFor="query" className="block text-lg font-medium text-[#221F26]">
          Research Query
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" />
          <textarea
            ref={textareaRef}
            id="query"
            className="w-full min-h-32 pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-[#33C3F0] resize-none overflow-hidden"
            placeholder={placeholders[placeholderIndex]}
            value={query.query}
            onChange={(e) => {
              setQuery({ ...query, query: e.target.value });
            }}
            onInput={adjustTextareaHeight}
            required
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Describe in your own words what qualitative insights you're looking for
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Sources */}
        <div className="space-y-3">
          <label className="block font-medium flex items-center gap-2">
            <Filter size={16} />
            Data Sources
          </label>
          
          <div className="space-y-2">
            <div className="font-medium text-sm mb-1">Live Sources:</div>
            <div className="bg-background rounded-lg p-4 border border-input">
              <div className="grid grid-cols-1 gap-3">
                {["twitter", "reddit", "news"].map((source) => (
                  <label key={source} className="flex items-center p-2 rounded-md hover:bg-muted transition-colors cursor-pointer group">
                    <div className="h-6 w-6 rounded border-2 flex items-center justify-center mr-3 border-primary bg-background group-hover:bg-primary/10">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSourceSelected(source as DataSource)}
                        onChange={(e) => handleSourceChange(source as DataSource)(e.target.checked)}
                      />
                      {isSourceSelected(source as DataSource) && <Check size={16} className="text-primary" />}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium capitalize">{source}</span>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Live
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Time Frame */}
        <TimeFrameSelector 
          selectedTimeFrame={query.timeFrame}
          onTimeFrameChange={(timeFrame) => setQuery({ ...query, timeFrame })}
        />
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <label htmlFor="keywords" className="block font-medium flex items-center gap-2">
          <Hash size={16} />
          Keywords Filter (Optional)
        </label>
        <div className="flex gap-2">
          <Input
            id="keywords"
            className="flex-grow"
            placeholder="Enter keywords to filter results"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
          />
          <Button type="button" variant="secondary" onClick={addKeyword}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {query.keywords.map((keyword) => (
            <span 
              key={keyword} 
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button 
          type="submit" 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5">
                <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" />
                </div>
              </div>
              <span>Gathering insights...</span>
            </div>
          ) : (
            "Reveal the Conversation"
          )}
        </Button>
      </div>
    </form>
  );
};

const EdgeFunctionStatus: React.FC<{
  status: string;
  lastPolledTime: Date | null;
  onCheckAgain: () => void;
}> = ({ status, lastPolledTime, onCheckAgain }) => {
  if (status === "checking") return null;

  const statusConfig = {
    available: {
      type: "success",
      title: "Edge Function Deployed",
      description: "The 'newsapi-proxy' Edge Function is active and ready to fetch real-time news data."
    },
    "available-no-key": {
      type: "warning",
      title: "API Key Missing",
      description: "The Edge Function is deployed but the NEWS_API_KEY is missing. Add it to your Edge Function secrets."
    },
    unavailable: {
      type: "warning",
      title: "Edge Function Not Available",
      description: "The 'newsapi-proxy' Edge Function could not be reached. No data will be available."
    },
    error: {
      type: "error",
      title: "Error Checking Edge Function",
      description: "An error occurred while checking the Edge Function status."
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <Alert className={`mb-6 ${
      status === 'available' ? 'bg-green-50 border-green-200' :
      status === 'error' ? 'bg-red-50 border-red-200' :
      'bg-amber-50 border-amber-200'
    }`}>
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>
        {config.description}
        {lastPolledTime && (
          <span className="text-xs block mt-1">
            Last checked: {lastPolledTime.toLocaleTimeString()}
          </span>
        )}
        {status !== 'available' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2 h-7 px-2 text-xs" 
            onClick={onCheckAgain}
          >
            Check Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

const TimeFrameSelector: React.FC<{
  selectedTimeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}> = ({ selectedTimeFrame, onTimeFrameChange }) => {
  const timeFrameOptions = [
    { value: 'real-time', label: 'Live Trends (24 hours)', description: 'See the latest discussions in real-time' },
    { value: 'short-term', label: 'Short-Term (Past 7 Days)', description: 'Track recent sentiment shifts' },
    { value: 'medium-term', label: 'Medium-Term (Past Month)', description: 'Identify emerging patterns and sustained sentiment trends', isDefault: true },
    { value: 'long-term', label: 'Long-Term (3-6 Months)', description: 'Understand trends over a quarter' },
    { value: 'historical', label: 'Historical View (6-12 Months)', description: 'Analyze sentiment shifts over a full year' },
    { value: 'deep-historical', label: 'Deep Historical View (1+ Year)', description: 'Gain insights on long-term behavioral patterns' }
  ];

  return (
    <div className="space-y-3">
      <label className="block font-medium flex items-center gap-2">
        <Clock size={16} />
        Time Frame
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {timeFrameOptions.map((option) => (
          <TooltipProvider key={option.value} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`px-3 py-2 rounded-md border transition-all duration-200 ${
                    selectedTimeFrame === option.value
                    ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(27,81,161,0.5)]" 
                    : "border-input hover:bg-accent/50"
                  } ${option.isDefault ? 'font-medium' : ''}`}
                  onClick={() => onTimeFrameChange(option.value as TimeFrame)}
                >
                  {option.label}
                  {option.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">
                      (Default)
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-primary/5 border-primary/20">
                {option.isDefault && (
                  <p className="text-primary/80 font-medium">Default Option</p>
                )}
                <p>{option.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default QueryForm;
