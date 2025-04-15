
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  FileText,
  GitBranch,
  Waves,
  LineChart,
  MessageCircle,
  Info,
  Calendar,
  Check,
  AlertTriangle,
  BrainCircuit,
  ThumbsUp,
  CircleEqual,
  ThumbsDown,
  TrendingUp
} from "lucide-react";
import { ResearchQuery, AnalysisResults, TimelineEvent, TimeFrame, SentimentFilter, TopicRippleData } from "@/services/types/qualitativeAnalysisTypes";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface ResultsDashboardProps {
  results: AnalysisResults;
  query: ResearchQuery;
  onNewSearch: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, query, onNewSearch }) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>(query.timeFrame);
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentFilter>(query.sentiment);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 border-green-300 text-green-800";
      case "negative": return "bg-red-100 border-red-300 text-red-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const handleExportPDF = () => {
    toast.success("Report export started. Your PDF will download shortly.");
    setTimeout(() => {
      toast.success("Report exported successfully!");
    }, 2000);
  };

  const filterByKeyword = (keyword: string) => {
    toast.info(`Filtering results for: ${keyword}`);
  };

  const navigateTo = (section: string) => {
    setActiveTab(section);
  };
  
  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    toast.info(`Viewing details for: ${event.label}`);
  };
  
  const getTopicColor = (topic: string) => {
    const colorMap: {[key: string]: string} = {
      "User Adoption": "#3182CE", // blue
      "Token Utility": "#38A169", // green
      "Platform Security": "#DD6B20", // orange
      "Governance": "#E53E3E", // red
      "Development Progress": "#805AD5", // purple
      "Community Growth": "#D69E2E" // yellow
    };
    
    return colorMap[topic] || "#718096"; // default gray
  };
  
  const getFilteredTopicData = () => {
    if (!selectedTopic) return results.topicRippleData;
    
    return results.topicRippleData.map(dataPoint => {
      const filteredPoint: TopicRippleData = { name: dataPoint.name };
      filteredPoint[selectedTopic] = dataPoint[selectedTopic];
      return filteredPoint;
    });
  };

  if (!results) {
    return <NoResults query={query.query} onNewSearch={onNewSearch} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="shadow-lg border-primary/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onNewSearch}
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-xl font-semibold text-[#221F26]">Results for: "{query.query}"</h3>
          </div>
          <div className="flex gap-2">
            {results && results.reportGeneratedAt && (
              <p className="text-xs text-muted-foreground self-center">
                Generated: {new Date(results.reportGeneratedAt).toLocaleString()}
              </p>
            )}
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              className="border-primary/30 hover:border-primary/60 flex items-center gap-2"
            >
              <Download size={16} />
              Export PDF
            </Button>
            <Button 
              variant="default" 
              onClick={onNewSearch}
              className="flex items-center gap-2"
            >
              New Search
            </Button>
          </div>
        </div>

        <div className="bg-primary/5 p-3 rounded-md mb-6 flex flex-wrap gap-3 items-center">
          <div className="font-medium text-primary text-sm">Filter Results:</div>
          
          <select 
            className="bg-white border border-primary/20 rounded-md px-2 py-1 text-sm"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as TimeFrame)}
          >
            <option value="real-time">Past 24 Hours</option>
            <option value="short-term">Past 7 Days</option>
            <option value="medium-term">Past Month</option>
            <option value="long-term">Past 3-6 Months</option>
            <option value="historical">Past 6-12 Months</option>
            <option value="deep-historical">1+ Year</option>
          </select>
          
          <select 
            className="bg-white border border-primary/20 rounded-md px-2 py-1 text-sm"
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value as SentimentFilter)}
          >
            <option value="all">All Sentiment</option>
            <option value="positive">Positive Only</option>
            <option value="neutral">Neutral Only</option>
            <option value="negative">Negative Only</option>
          </select>
          
          <div className="flex-grow">
            <Input
              placeholder="Search within results..."
              className="h-8 text-sm"
            />
          </div>
        </div>
        
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="summary" className="flex items-center gap-1.5">
              <FileText size={16} />
              Summary
            </TabsTrigger>
            <TabsTrigger value="storyline" className="flex items-center gap-1.5">
              <GitBranch size={16} />
              Storyline
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-1.5">
              <Waves size={16} />
              Topic Ripples
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-1.5">
              <LineChart size={16} />
              Trends
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center gap-1.5">
              <MessageCircle size={16} />
              Quotes
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <div className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-lg mb-2 text-primary">AI Analysis Summary</h4>
                <p className="text-muted-foreground">
                  {results.aiSummary}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-600" />
                    Key Insights
                  </h5>
                  <ul className="space-y-2">
                    {results.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 text-primary">
                          <Check size={14} />
                        </div>
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                
                <Card className="p-4">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600" />
                    Challenges & Concerns
                  </h5>
                  <ul className="space-y-2">
                    {results.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 text-amber-600">
                          <AlertTriangle size={14} />
                        </div>
                        <span className="text-sm">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                
                <Card className="p-4">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <BrainCircuit size={18} className="text-purple-600" />
                    Recommendations
                  </h5>
                  <ul className="space-y-2">
                    {results.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 text-purple-600">
                          <Info size={14} />
                        </div>
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Storyline Tab */}
          <TabsContent value="storyline" className="space-y-6">
            <div className="space-y-8">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-lg mb-2 text-primary">Narrative Timeline</h4>
                <p className="text-muted-foreground">
                  Discover how the conversation has evolved over time and identify key moments that shaped sentiment and opinion.
                </p>
              </div>
              
              <div className="relative">
                <div className="absolute top-11 left-0 right-0 h-1.5 bg-primary/20 rounded-full"></div>
                
                <div className="relative pt-6 pb-12">
                  {results.timelineEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="absolute transform -translate-x-1/2"
                      style={{ left: event.position }}
                    >
                      <button
                        onClick={() => handleEventClick(event)}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                          selectedEvent?.id === event.id ? 'scale-110' : 'hover:scale-105'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          selectedEvent?.id === event.id 
                            ? 'border-primary bg-primary text-white' 
                            : `border-${event.sentiment === 'positive' ? 'green' : event.sentiment === 'negative' ? 'red' : 'gray'}-400 bg-white`
                        }`}>
                          <Calendar size={18} />
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap">{event.date}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedEvent && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{selectedEvent.label}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>{selectedEvent.date}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(selectedEvent.sentiment)}`}>
                          {selectedEvent.sentiment.charAt(0).toUpperCase() + selectedEvent.sentiment.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-medium text-primary">
                      Impact: {selectedEvent.impact}%
                    </div>
                  </div>
                  <p className="text-muted-foreground">{selectedEvent.description}</p>
                  
                  {selectedEvent.quotes && (
                    <div className="mt-4">
                      <h5 className="font-medium text-sm mb-2">Representative Quotes:</h5>
                      <div className="space-y-2">
                        {selectedEvent.quotes.map((quote, idx) => (
                          <div key={idx} className="bg-background p-3 rounded-md text-sm border border-input">
                            "{quote.text}"
                            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                              <span>{quote.source}</span>
                              <span>{quote.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-6">
            <div className="space-y-8">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-lg mb-2 text-primary">Topic Ripples</h4>
                <p className="text-muted-foreground">
                  Explore how different topics rise and fall in conversation volumes over time, revealing patterns and connections.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTopic === null ? "secondary" : "outline"}
                  onClick={() => setSelectedTopic(null)}
                  className="text-sm"
                >
                  All Topics
                </Button>
                
                {results.topicRippleData.length > 0 && Object.keys(results.topicRippleData[0])
                  .filter(key => key !== 'name')
                  .map((topic) => (
                    <Button
                      key={topic}
                      variant={selectedTopic === topic ? "secondary" : "outline"}
                      onClick={() => setSelectedTopic(topic)}
                      className="text-sm"
                      style={{
                        backgroundColor: selectedTopic === topic ? getTopicColor(topic) : 'transparent',
                        borderColor: getTopicColor(topic),
                        color: selectedTopic === topic ? 'white' : getTopicColor(topic)
                      }}
                    >
                      {topic}
                    </Button>
                  ))
                }
              </div>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getFilteredTopicData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toString()}
                    />
                    <RechartsTooltip 
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    
                    {results.topicRippleData.length > 0 && Object.keys(results.topicRippleData[0])
                      .filter(key => key !== 'name')
                      .filter(topic => !selectedTopic || topic === selectedTopic)
                      .map((topic) => (
                        <Area
                          key={topic}
                          type="monotone"
                          dataKey={topic}
                          stroke={getTopicColor(topic)}
                          fill={getTopicColor(topic)}
                          fillOpacity={0.3}
                          activeDot={{ r: 6 }}
                        />
                      ))
                    }
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {results.topicInsights && results.topicInsights.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Topic Insights:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.topicInsights.map((insight, idx) => (
                      <Card key={idx} className="p-4">
                        <h5 className="font-medium text-base mb-2">{insight.topic}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-primary">Trend: {insight.trend}</span>
                          <span className={`px-2 py-0.5 rounded ${getSentimentColor(insight.sentiment)}`}>
                            {insight.sentiment.charAt(0).toUpperCase() + insight.sentiment.slice(1)}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <p>Trends analysis data will be displayed here...</p>
          </TabsContent>
          
          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <p>Representative quotes will be displayed here...</p>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

const NoResults: React.FC<{ query: string; onNewSearch: () => void }> = ({ query, onNewSearch }) => (
  <Card className="shadow-lg border-primary/20 p-8">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onNewSearch}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-xl font-semibold text-[#221F26]">Results for: "{query}"</h3>
      </div>
      <Button 
        variant="default" 
        onClick={onNewSearch}
        className="flex items-center gap-2"
      >
        New Search
      </Button>
    </div>
    
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
        <Info size={32} />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Analysis Results</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        We couldn't find any results matching your search criteria. Try broadening your search terms, 
        changing the time frame, or selecting different data sources.
      </p>
      <Button variant="outline" onClick={onNewSearch}>
        Try a Different Search
      </Button>
    </div>
  </Card>
);

export default ResultsDashboard;
