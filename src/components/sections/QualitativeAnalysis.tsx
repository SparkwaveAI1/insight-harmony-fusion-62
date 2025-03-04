import React, { useState, useEffect, useRef } from "react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";
import Logo from "../ui-custom/Logo";
import { 
  BarChart3, 
  Filter, 
  Search, 
  Clock, 
  Hash, 
  Loader2, 
  BrainCircuit, 
  TrendingUp, 
  Info, 
  Check, 
  AlertTriangle, 
  ThumbsUp, 
  CircleEqual, 
  ThumbsDown 
} from "lucide-react";
import { toast } from "sonner";
import { 
  ResearchQuery, 
  DataSource, 
  SentimentFilter, 
  TimeFrame,
  AnalysisResults
} from "@/services/types/qualitativeAnalysisTypes";
import { fetchQualitativeData } from "@/services/api/dataSourceService";
import ApiKeyManager from "../ApiKeyManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting query:", query);
    
    if (!query.query.trim()) {
      toast.error("Please enter a research query");
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await fetchQualitativeData(query);
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

  const handleNewSearch = () => {
    setShowResults(false);
  };
  
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

  const getSentimentIconAndColor = (sentiment: SentimentFilter) => {
    switch (sentiment) {
      case "positive":
        return { 
          icon: <ThumbsUp size={18} className="text-green-600" />, 
          color: "border-green-200 bg-green-50 hover:bg-green-100 data-[state=active]:bg-green-100 data-[state=active]:border-green-300"
        };
      case "neutral":
        return { 
          icon: <CircleEqual size={18} className="text-gray-600" />, 
          color: "border-gray-200 bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-gray-100 data-[state=active]:border-gray-300"
        };
      case "negative":
        return { 
          icon: <ThumbsDown size={18} className="text-red-600" />, 
          color: "border-red-200 bg-red-50 hover:bg-red-100 data-[state=active]:bg-red-100 data-[state=active]:border-red-300"
        };
      case "all":
      default:
        return { 
          icon: <Info size={18} className="text-blue-600" />, 
          color: "border-blue-200 bg-blue-50 hover:bg-blue-100 data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300"
        };
    }
  };

  return (
    <Section className="bg-gradient-to-b from-accent to-background py-20" highlight={true}>
      <div className="container max-w-5xl mx-auto">
        <Reveal>
          <div className="flex justify-between items-center mb-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Logo size="lg" />
                <span className="text-sm font-medium px-3 py-1 bg-[#FEF7CD] text-[#403E43] rounded-full">
                  Qualitative Insights Conductor
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-3 text-[#221F26]">
                AI That Thinks Like a Human, Not a Machine
              </h2>
              <p className="text-muted-foreground text-lg">
                Uncover the real thoughts, opinions, and emotions driving conversations—beyond data, beyond numbers.
              </p>
            </div>
            <ApiKeyManager />
          </div>
        </Reveal>

        {!showResults ? (
          <Reveal delay={200}>
            <Card className="shadow-lg mb-8 border-[#33C3F0]/20">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <div className="space-y-3">
                    <label className="block font-medium flex items-center gap-2">
                      <Filter size={16} />
                      Data Sources
                    </label>
                    
                    <div className="space-y-2">
                      <div className="font-medium text-sm mb-1">Live Sources:</div>
                      <div className="bg-background rounded-lg p-4 border border-input">
                        <div className="grid grid-cols-1 gap-3">
                          <label className="flex items-center p-2 rounded-md hover:bg-muted transition-colors cursor-pointer group">
                            <div className="h-6 w-6 rounded border-2 flex items-center justify-center mr-3 border-primary bg-background group-hover:bg-primary/10">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isSourceSelected("twitter")}
                                onChange={(e) => handleSourceChange("twitter")(e.target.checked)}
                              />
                              {isSourceSelected("twitter") && <Check size={16} className="text-primary" />}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">Twitter</span>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Live
                              </span>
                            </div>
                          </label>
                          
                          <label className="flex items-center p-2 rounded-md hover:bg-muted transition-colors cursor-pointer group">
                            <div className="h-6 w-6 rounded border-2 flex items-center justify-center mr-3 border-primary bg-background group-hover:bg-primary/10">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isSourceSelected("reddit")}
                                onChange={(e) => handleSourceChange("reddit")(e.target.checked)}
                              />
                              {isSourceSelected("reddit") && <Check size={16} className="text-primary" />}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">Reddit</span>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Live
                              </span>
                            </div>
                          </label>
                          
                          <label className="flex items-center p-2 rounded-md hover:bg-muted transition-colors cursor-pointer group">
                            <div className="h-6 w-6 rounded border-2 flex items-center justify-center mr-3 border-primary bg-background group-hover:bg-primary/10">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isSourceSelected("news")}
                                onChange={(e) => handleSourceChange("news")(e.target.checked)}
                              />
                              {isSourceSelected("news") && <Check size={16} className="text-primary" />}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">News & Blogs</span>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Live
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="block font-medium flex items-center gap-2">
                        <BarChart3 size={16} />
                        Which voices do you want to hear?
                      </label>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {(["positive", "neutral", "negative", "all"] as SentimentFilter[]).map((sentimentOption) => {
                          const { icon, color } = getSentimentIconAndColor(sentimentOption);
                          const isActive = query.sentiment === sentimentOption;
                          
                          return (
                            <button
                              key={sentimentOption}
                              type="button"
                              className={`flex items-center gap-2 px-4 py-3 rounded-md border text-left transition-all
                                ${color} ${isActive ? 'ring-2 ring-primary/30' : ''}
                              `}
                              onClick={() => setQuery({ ...query, sentiment: sentimentOption })}
                              data-state={isActive ? 'active' : 'inactive'}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-current/10 shrink-0">
                                {icon}
                              </div>
                              <div className="flex-grow">
                                <span className="font-medium">
                                  {sentimentOption === "positive" && "Positive"}
                                  {sentimentOption === "neutral" && "Neutral"}
                                  {sentimentOption === "negative" && "Negative"}
                                  {sentimentOption === "all" && "All Perspectives"}
                                </span>
                                <span className="block text-sm text-muted-foreground">
                                  {sentimentOption === "positive" && "Supporters & Enthusiasts"}
                                  {sentimentOption === "neutral" && "Balanced & Informational"}
                                  {sentimentOption === "negative" && "Concerns & Criticism"}
                                  {sentimentOption === "all" && 
                                    <span className="flex items-center gap-1">
                                      Recommended
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        Full spectrum
                                      </span>
                                    </span>
                                  }
                                </span>
                              </div>
                              {isActive && (
                                <Check size={18} className="text-primary ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block font-medium flex items-center gap-2">
                        <Clock size={16} />
                        Time Frame
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`px-3 py-2 rounded-md border transition-all duration-200 ${
                                  query.timeFrame === "real-time" 
                                  ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(51,195,240,0.5)]" 
                                  : "border-input hover:bg-accent/50"
                                }`}
                                onClick={() => setQuery({ ...query, timeFrame: "real-time" })}
                              >
                                Live Trends (24 hours)
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-[#33C3F0]/5 border-[#33C3F0]/20">
                              <p>See the latest discussions in real-time</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`px-3 py-2 rounded-md border transition-all duration-200 ${
                                  query.timeFrame === "short-term" 
                                  ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(51,195,240,0.5)]" 
                                  : "border-input hover:bg-accent/50"
                                }`}
                                onClick={() => setQuery({ ...query, timeFrame: "short-term" })}
                              >
                                Short-Term (Past 7 Days)
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-[#33C3F0]/5 border-[#33C3F0]/20">
                              <p>Track recent sentiment shifts</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`px-3 py-2 rounded-md border transition-all duration-200 ${
                                  query.timeFrame === "medium-term" 
                                  ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(51,195,240,0.5),0_2px_12px_rgba(51,195,240,0.25)] font-medium" 
                                  : "border-input hover:bg-accent/50"
                                }`}
                                onClick={() => setQuery({ ...query, timeFrame: "medium-term" })}
                              >
                                Medium-Term (Past Month) <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">(Default)</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-[#33C3F0]/5 border-[#33C3F0]/20">
                              <p className="text-primary/80 font-medium">Default Option</p>
                              <p>Identify emerging patterns and sustained sentiment trends</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`px-3 py-2 rounded-md border transition-all duration-200 ${
                                  query.timeFrame === "long-term" 
                                  ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(51,195,240,0.5)]" 
                                  : "border-input hover:bg-accent/50"
                                }`}
                                onClick={() => setQuery({ ...query, timeFrame: "long-term" })}
                              >
                                Long-Term (3-6 Months)
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-[#33C3F0]/5 border-[#33C3F0]/20">
                              <p>Understand trends over a quarter</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`px-3 py-2 rounded-md border transition-all duration-200 ${
                                  query.timeFrame === "historical" 
                                  ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(51,195,240,0.5)]" 
                                  : "border-input hover:bg-accent/50"
                                }`}
                                onClick={() => setQuery({ ...query, timeFrame: "historical" })}
                              >
                                Historical View (6-12 Months)
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-[#33C3F0]/5 border-[#33C3F0]/20">
                              <p>Analyze sentiment shifts over a full year</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`px-3 py-2 rounded-md border transition-all duration-200 ${
                                  query.timeFrame === "deep-historical" 
                                  ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(51,195,240,0.5)]" 
                                  : "border-input hover:bg-accent/50"
                                }`}
                                onClick={() => setQuery({ ...query, timeFrame: "deep-historical" })}
                              >
                                Deep Historical View (1+ Year)
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-[#33C3F0]/5 border-[#33C3F0]/20">
                              <p>Gain insights on long-term behavioral patterns</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>

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

                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    size="lg"
                    className="bg-[#33C3F0] hover:bg-[#1EAEDB] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5">
                          <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
                            <Loader2 className="animate-spin" size={20} />
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

interface ResultsDashboardProps {
  results: AnalysisResults;
  query: ResearchQuery;
  onNewSearch: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, query, onNewSearch }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 border-green-300 text-green-800";
      case "negative": return "bg-red-100 border-red-300 text-red-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-8">
      <Reveal>
        <Card className="shadow-lg border-[#33C3F0]/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#221F26]">Results for: "{query.query}"</h3>
            <div className="flex gap-2">
              {results.reportGeneratedAt && (
                <p className="text-xs text-muted-foreground self-center">
                  Generated: {new Date(results.reportGeneratedAt).toLocaleString()}
                </p>
              )}
              <Button 
                variant="outline" 
                onClick={onNewSearch}
                className="border-[#33C3F0]/30 hover:border-[#33C3F0]/60"
              >
                New Search
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="mb-4 grid grid-cols-3 md:grid-cols-4 bg-[#F1F1F1]">
              <TabsTrigger value="summary" className="data-[state=active]:bg-[#33C3F0] data-[state=active]:text-white">Summary</TabsTrigger>
              <TabsTrigger value="quotes" className="data-[state=active]:bg-[#33C3F0] data-[state=active]:text-white">Example Quotes</TabsTrigger>
              <TabsTrigger value="ai-insights" className="flex items-center gap-1 data-[state=active]:bg-[#33C3F0] data-[state=active]:text-white">
                <BrainCircuit size={14} />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-1 data-[state=active]:bg-[#33C3F0] data-[state=active]:text-white">
                <TrendingUp size={14} />
                Trends Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium mb-4 border-b pb-2">Top Emerging Topics</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    {results.topTopics.map((topic, index) => (
                      <li key={index} className="text-base">{topic}</li>
                    ))}
                  </ol>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-4 border-b pb-2">Sentiment Breakdown</h4>
                  <div className="h-10 w-full rounded-full overflow-hidden bg-gray-200 mb-4">
                    <div className="flex h-full">
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${results.sentimentBreakdown.positive}%` }}
                        title={`Positive: ${results.sentimentBreakdown.positive}%`}
                      ></div>
                      <div 
                        className="bg-gray-400 h-full" 
                        style={{ width: `${results.sentimentBreakdown.neutral}%` }}
                        title={`Neutral: ${results.sentimentBreakdown.neutral}%`}
                      ></div>
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${results.sentimentBreakdown.negative}%` }}
                        title={`Negative: ${results.sentimentBreakdown.negative}%`}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span>Positive ({results.sentimentBreakdown.positive}%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                      <span>Neutral ({results.sentimentBreakdown.neutral}%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span>Negative ({results.sentimentBreakdown.negative}%)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-4 border-b pb-2">Key Phrases</h4>
                <div className="flex flex-wrap gap-2">
                  {results.keyPhrases.map((phrase, index) => (
                    <span 
                      key={index} 
                      className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm"
                      style={{
                        fontSize: `${Math.random() * 0.5 + 0.8}rem`
                      }}
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quotes" className="space-y-6">
              <h4 className="text-lg font-medium mb-4 border-b pb-2">Example Quotes from Sources</h4>
              <div className="space-y-4">
                {results.exampleQuotes.map((quote, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${getSentimentColor(quote.sentiment)}`}
                  >
                    <p className="text-base italic">"{quote.text}"</p>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="font-medium">Sentiment: {quote.sentiment}</span>
                      <span>Source: {quote.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="ai-insights" className="space-y-6">
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="text-primary" />
                  <h4 className="text-lg font-medium">AI-Powered Insights</h4>
                </div>
                <div className="space-y-3">
                  {results.aiInsights ? (
                    results.aiInsights.map((insight, index) => (
                      <div key={index} className="p-3 bg-background rounded-md border">
                        <p>{insight}</p>
                      </div>
                    ))
                  ) : (
                    <p>No AI insights available for this query.</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  These insights are generated by our advanced AI model based on pattern analysis of the collected data.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-6">
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-primary" />
                  <h4 className="text-lg font-medium">Trends Analysis</h4>
                </div>
                {results.trendsAnalysis ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: results.trendsAnalysis.replace(/\n\n/g, '<br/><br/>').replace(/###\s(.*)/g, '<h3>$1</h3>').replace(/##\s(.*)/g, '<h2>$1</h2>') }} />
                ) : (
                  <p>No trends analysis available for this query.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </Reveal>
    </div>
  );
};

export default QualitativeAnalysis;
