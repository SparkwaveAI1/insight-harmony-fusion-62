import { ResearchQuery, AnalysisResults, QuoteData } from "../types/qualitativeAnalysisTypes";
import { generateAIInsights, generateTrendsAnalysis } from "../ai/aiInsightsService";

// Function to fetch qualitative data from mock service
export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock results
  return generateMockResults(query);
}

// Fallback to generate mock results if API calls fail
export function generateMockResults(query: ResearchQuery): AnalysisResults {
  const topTopics = generateTopTopics(query);
  const sentimentBreakdown = generateSentimentBreakdown(query);
  const exampleQuotes = generateExampleQuotes(query);
  const keyPhrases = generateKeyPhrases(query);
  const aiInsights = generateAIInsights(topTopics, sentimentBreakdown, keyPhrases, query);
  const trendsAnalysis = generateTrendsAnalysis(sentimentBreakdown, topTopics, query);
  
  return {
    topTopics,
    sentimentBreakdown,
    exampleQuotes,
    keyPhrases,
    aiInsights,
    trendsAnalysis,
    reportGeneratedAt: new Date().toISOString()
  };
}

function generateTopTopics(query: ResearchQuery): string[] {
  const queryText = query.query.toLowerCase();
  
  if (queryText.includes("token") || queryText.includes("staking")) {
    return [
      "Staking rewards uncertainty",
      "Security risks in new platforms",
      "Regulatory fears affecting adoption"
    ];
  } else if (queryText.includes("regulation") || queryText.includes("compliance")) {
    return [
      "Regulatory uncertainty in major markets",
      "Compliance costs for small projects",
      "Impact of regulations on innovation"
    ];
  } else if (queryText.includes("nft") || queryText.includes("collectible")) {
    return [
      "Utility beyond speculation",
      "Environmental impact concerns",
      "Integration with traditional art markets"
    ];
  } else {
    return [
      "User adoption challenges",
      "Technology integration issues",
      "Market sentiment shifts"
    ];
  }
}

function generateSentimentBreakdown(query: ResearchQuery): { positive: number; neutral: number; negative: number } {
  if (query.sentiment === "positive") {
    return { positive: 75, neutral: 20, negative: 5 };
  } else if (query.sentiment === "negative") {
    return { positive: 25, neutral: 30, negative: 45 };
  } else if (query.sentiment === "neutral") {
    return { positive: 30, neutral: 60, negative: 10 };
  } else {
    // Create a more random distribution for "all" sentiment
    const positive = 30 + Math.floor(Math.random() * 30);
    const negative = Math.floor(Math.random() * 30);
    const neutral = 100 - positive - negative;
    return { positive, neutral, negative };
  }
}

function generateExampleQuotes(query: ResearchQuery): QuoteData[] {
  const queryText = query.query.toLowerCase();
  const sources = query.sources.includes("all") 
    ? ["Twitter", "Reddit", "News"] 
    : query.sources.map(s => s.charAt(0).toUpperCase() + s.slice(1));
  
  const quotes: QuoteData[] = [];
  
  // Positive quote
  if (query.sentiment === "all" || query.sentiment === "positive") {
    if (queryText.includes("token") || queryText.includes("staking")) {
      quotes.push({
        text: "I've been staking my tokens for 3 months and the rewards have been consistent and higher than expected.",
        sentiment: "positive",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    } else {
      quotes.push({
        text: "This innovation is exactly what the industry needed. I'm seeing significant benefits already.",
        sentiment: "positive",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    }
  }
  
  // Neutral quote
  if (query.sentiment === "all" || query.sentiment === "neutral") {
    if (queryText.includes("token") || queryText.includes("staking")) {
      quotes.push({
        text: "The security of these new staking platforms is still unproven. I'm waiting to see more audits.",
        sentiment: "neutral",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    } else {
      quotes.push({
        text: "There are both pros and cons to this approach. We need more data before making definitive judgments.",
        sentiment: "neutral",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    }
  }
  
  // Negative quote
  if (query.sentiment === "all" || query.sentiment === "negative") {
    if (queryText.includes("token") || queryText.includes("staking")) {
      quotes.push({
        text: "Regulatory uncertainty makes me hesitant to lock up my assets in staking contracts for long periods.",
        sentiment: "negative",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    } else {
      quotes.push({
        text: "I've been disappointed by the results so far. The promised benefits aren't materializing as expected.",
        sentiment: "negative",
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    }
  }
  
  return quotes;
}

function generateKeyPhrases(query: ResearchQuery): string[] {
  const baseKeywords = ["adoption", "implementation", "community feedback", "future development"];
  const queryText = query.query.toLowerCase();
  
  // Add query-specific keywords
  if (queryText.includes("token") || queryText.includes("staking")) {
    return [
      ...baseKeywords,
      "high APY", 
      "liquidity concerns", 
      "validator requirements", 
      "regulatory compliance", 
      "reward distribution", 
      "lock-up periods", 
      "slashing risks"
    ];
  } else if (queryText.includes("nft") || queryText.includes("collectible")) {
    return [
      ...baseKeywords,
      "floor price", 
      "rarity attributes", 
      "royalty payments", 
      "secondary markets", 
      "utility features", 
      "authenticating ownership"
    ];
  } else {
    return [
      ...baseKeywords,
      "technical integration", 
      "user experience", 
      "security features", 
      "competitive advantage", 
      "market timing", 
      "innovation factors"
    ];
  }
}
