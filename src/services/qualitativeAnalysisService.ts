
import { toast } from "sonner";

export type DataSource = "twitter" | "reddit" | "news" | "farcaster" | "all";
export type SentimentFilter = "positive" | "neutral" | "negative" | "all";
export type TimeFrame = "real-time" | "short-term" | "medium-term" | "long-term";

export interface ResearchQuery {
  query: string;
  sources: DataSource[];
  sentiment: SentimentFilter;
  timeFrame: TimeFrame;
  keywords: string[];
}

export interface QuoteData {
  text: string;
  sentiment: string;
  source: string;
}

export interface AnalysisResults {
  topTopics: string[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  exampleQuotes: QuoteData[];
  keyPhrases: string[];
}

// This is a temporary mock implementation until we can connect to a real API
// In a production app, this would connect to your backend services
export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults> {
  console.log("Fetching qualitative data for:", query);
  
  // Simulate API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate dynamic results based on the query
      const results: AnalysisResults = {
        topTopics: generateTopTopics(query),
        sentimentBreakdown: generateSentimentBreakdown(query),
        exampleQuotes: generateExampleQuotes(query),
        keyPhrases: generateKeyPhrases(query)
      };
      
      resolve(results);
    }, 2000); // 2 second delay to simulate API call
  });
}

// Helper functions to generate dynamic mock data based on user query
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
    ? ["Twitter", "Reddit", "News", "Farcaster"] 
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
