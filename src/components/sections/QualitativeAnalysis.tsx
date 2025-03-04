
import React, { useState } from "react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";
import { BarChart3, Filter, Search, Clock, Hash, Loader2, BrainCircuit, TrendingUp } from "lucide-react";
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

const QualitativeAnalysis: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [query, setQuery] = useState<ResearchQuery>({
    query: "",
    sources: ["all"],
    sentiment: "all",
    timeFrame: "short-term",
    keywords: []
  });
  const [keywordInput, setKeywordInput] = useState("");

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

  return (
    <Section className="bg-gradient-to-b from-accent to-background py-20" highlight={true}>
      <div className="container max-w-5xl mx-auto">
        <Reveal>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              PersonaAI Qualitative Intelligence
            </h2>
            <ApiKeyManager />
          </div>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Discover the real conversations and sentiment around your topics of interest
          </p>
        </Reveal>

        {!showResults ? (
          <Reveal delay={200}>
            <Card className="shadow-lg mb-8 border-primary/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="query" className="block text-lg font-medium">
                    Research Query
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <textarea
                      id="query"
                      className="w-full h-32 pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="What are people saying about AI token staking incentives?"
                      value={query.query}
                      onChange={(e) => setQuery({ ...query, query: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Describe in your own words what qualitative insights you're looking for
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="sources" className="block font-medium flex items-center gap-2">
                      <Filter size={16} />
                      Data Sources
                    </label>
                    <select
                      id="sources"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={query.sources[0]}
                      onChange={(e) => setQuery({ ...query, sources: [e.target.value as DataSource] })}
                    >
                      <option value="all">All Sources</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="reddit">Reddit</option>
                      <option value="news">News Articles</option>
                      <option value="farcaster">Farcaster</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sentiment" className="block font-medium flex items-center gap-2">
                      <BarChart3 size={16} />
                      Sentiment Focus
                    </label>
                    <select
                      id="sentiment"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={query.sentiment}
                      onChange={(e) => setQuery({ ...query, sentiment: e.target.value as SentimentFilter })}
                    >
                      <option value="all">All Perspectives</option>
                      <option value="positive">Supporters (Positive)</option>
                      <option value="neutral">Neutral Opinions</option>
                      <option value="negative">Criticism & Concerns</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="timeFrame" className="block font-medium flex items-center gap-2">
                      <Clock size={16} />
                      Time Frame
                    </label>
                    <select
                      id="timeFrame"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={query.timeFrame}
                      onChange={(e) => setQuery({ ...query, timeFrame: e.target.value as TimeFrame })}
                    >
                      <option value="real-time">Real-time (Last 24 hours)</option>
                      <option value="short-term">Short-term (Past week)</option>
                      <option value="medium-term">Medium-term (Past month)</option>
                      <option value="long-term">Long-term (3-6 months)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="keywords" className="block font-medium flex items-center gap-2">
                    <Hash size={16} />
                    Keywords Filter (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="keywords"
                      className="flex-grow px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Generate Insights"
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
        <Card className="shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Results for: "{query.query}"</h3>
            <div className="flex gap-2">
              {results.reportGeneratedAt && (
                <p className="text-xs text-muted-foreground self-center">
                  Generated: {new Date(results.reportGeneratedAt).toLocaleString()}
                </p>
              )}
              <Button variant="outline" onClick={onNewSearch}>New Search</Button>
            </div>
          </div>
          
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="mb-4 grid grid-cols-3 md:grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="quotes">Example Quotes</TabsTrigger>
              <TabsTrigger value="ai-insights" className="flex items-center gap-1">
                <BrainCircuit size={14} />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-1">
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
