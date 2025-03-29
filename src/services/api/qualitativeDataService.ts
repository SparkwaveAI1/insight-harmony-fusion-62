
import { ResearchQuery, AnalysisResults, QuoteData } from "../types/qualitativeAnalysisTypes";
import { toast } from "sonner";
import { generateAIInsights, generateTrendsAnalysis } from "../ai/aiInsightsService";
import { fetchTwitterData, fetchRedditData, fetchNewsData } from "./dataSourceApi";
import { handleApiError } from "../utils/apiUtils";
import { calculateSentimentBreakdown } from "../utils/sentimentUtils";
import { 
  sortQuotesByRelevance,
  consolidateTopics,
  extractKeyInsights,
  identifyChallenges,
  generateRecommendations,
  generateTimelineFromQuotes,
  generateTopicRippleData,
  generateTopicInsights,
  generateSourceBreakdown
} from "./qualitativeDataUtils";

/**
 * Main function to fetch qualitative data from various sources based on a research query
 */
export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults | null> {
  try {
    console.log("Fetching qualitative data for query:", query);
    
    const sourceResults: { [key: string]: boolean } = {};
    let quotes: QuoteData[] = [];
    let keywords: string[] = [];
    let topics: string[] = [];
    
    const sourcesToQuery = query.sources || ["news"];
    
    console.log("Using data sources:", sourcesToQuery);
    
    const apiPromises = sourcesToQuery.map(source => {
      const fetcher = getFetcherForSource(source);
      return fetcher(query).then(result => {
        console.log(`Received data from ${source}:`, result);
        
        sourceResults[source] = result.quotes.length > 0;
        
        if (result.quotes.length > 0) {
          quotes = [...quotes, ...result.quotes];
          keywords = [...keywords, ...result.keywords];
          topics = [...topics, ...result.topics];
          
          toast.success(`Retrieved ${result.quotes.length} quotes from ${source}`);
        } else {
          console.warn(`No quotes returned from ${source}`);
        }
      }).catch(error => {
        handleApiError(error, `${source} API`);
        sourceResults[source] = false;
      });
    });
    
    await Promise.all(apiPromises);
    
    const anySourceSucceeded = Object.values(sourceResults).some(success => success);
    if (!anySourceSucceeded || quotes.length === 0) {
      console.log("No data returned from any source");
      
      toast.info("No data found from available sources. Try a different search query or check Edge Function deployment.", {
        duration: 5000
      });
      
      return null;
    }
    
    if (query.sentiment !== "all") {
      quotes = quotes.filter(quote => quote.sentiment === query.sentiment);
      
      if (quotes.length === 0) {
        toast.info(`No ${query.sentiment} sentiment quotes found in the results`, {
          description: "Try selecting 'all' for sentiment filtering",
          duration: 5000
        });
        return null;
      }
    }
    
    // Sort quotes by relevance and sentiment for better presentation
    quotes = sortQuotesByRelevance(quotes, query.query);
    
    const sentimentBreakdown = calculateSentimentBreakdown(quotes);
    
    // Group topics to identify top themes
    const topTopics = consolidateTopics(topics);
    
    const aiInsights = generateAIInsights(topTopics, sentimentBreakdown, keywords, query);
    const trendsAnalysis = [generateTrendsAnalysis(sentimentBreakdown, topTopics, query)];
    
    // Extract real key insights from the quotes
    const keyInsights = extractKeyInsights(quotes, query);
    
    // Identify challenges based on negative sentiment quotes
    const challenges = identifyChallenges(quotes.filter(q => q.sentiment === "negative"), query);
    
    // Generate actionable recommendations
    const recommendations = generateRecommendations(quotes, topTopics, query);
    
    // Generate timeline events based on actual quotes
    const timelineEvents = generateTimelineFromQuotes(quotes);
    
    // Generate topic ripple data from actual topics
    const topicRippleData = generateTopicRippleData(topTopics);
    
    // Generate topic insights from actual data
    const topicInsights = generateTopicInsights(topTopics, quotes);
    
    return {
      topTopics,
      sentimentBreakdown,
      exampleQuotes: quotes.slice(0, 10),
      keyPhrases: keywords,
      aiInsights,
      trendsAnalysis,
      reportGeneratedAt: new Date().toISOString(),
      aiSummary: `Analysis of conversations around "${query.query}" based on ${quotes.length} collected quotes.`,
      keyInsights,
      challenges,
      recommendations,
      timelineEvents,
      topicRippleData,
      topicInsights,
      sourceBreakdown: generateSourceBreakdown(quotes)
    };
  } catch (error) {
    handleApiError(error, "Qualitative data fetching");
    return null;
  }
}

function getFetcherForSource(source: string) {
  switch (source) {
    case "twitter":
      return fetchTwitterData;
    case "reddit":
      return fetchRedditData;
    case "news":
      return fetchNewsData;
    default:
      return fetchNewsData;
  }
}
