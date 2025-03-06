
import { ResearchQuery, AnalysisResults, QuoteData, SentimentFilter } from "../types/qualitativeAnalysisTypes";
import { generateAIInsights, generateTrendsAnalysis } from "../ai/aiInsightsService";

// Function to fetch qualitative data from mock service
export async function fetchQualitativeData(query: ResearchQuery): Promise<AnalysisResults> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Check for predefined AI tokens query
  if (query.query.toLowerCase().includes("ai token") && 
      query.query.toLowerCase().includes("fear")) {
    return generateAITokensFearsMockData(query);
  }
  
  // Generate standard mock results for other queries
  return generateMockResults(query);
}

// Mock data specifically for AI tokens fears query
function generateAITokensFearsMockData(query: ResearchQuery): AnalysisResults {
  const topTopics = [
    "Regulatory Crackdowns",
    "Market Speculation",
    "AI Utility vs. Hype",
    "VC & Insider Dumping"
  ];
  
  const sentimentBreakdown = {
    positive: 30, 
    neutral: 45, 
    negative: 25
  };
  
  const keyPhrases = [
    "SEC investigation", 
    "regulatory concerns",
    "token utility",
    "AI hype cycle",
    "market rotation",
    "VC exit strategy",
    "revenue models",
    "staking incentives",
    "AI narratives",
    "tokenomics issues",
    "revenue capture",
    "long-term adoption"
  ];
  
  const exampleQuotes: QuoteData[] = [
    {
      text: "AI is the future. This is just a dip before we see trillion-dollar AI projects in crypto. Staking in AI projects is the next big thing!",
      sentiment: "positive" as SentimentFilter,
      source: "Twitter (@AIInvestorX)"
    },
    {
      text: "Not saying AI tokens are dead, but outside of narratives, what are they actually doing differently from traditional crypto projects?",
      sentiment: "neutral" as SentimentFilter,
      source: "Twitter (@BlockAnalyst)"
    },
    {
      text: "If AI is so powerful, why do AI tokens rely on speculation instead of actual revenue? Looks like another VC exit pump to me.",
      sentiment: "negative" as SentimentFilter,
      source: "Twitter (@CryptoRealist)"
    },
    {
      text: "So many AI token projects seem to be launching with vague 'AI-powered' claims but no actual working models. We need a major AI crypto win to justify this sector.",
      sentiment: "negative" as SentimentFilter,
      source: "Reddit (u/Web3DeepDiver)"
    },
    {
      text: "Is anyone actually using AI tokens in a way that isn't just staking for emissions? I'm struggling to find one that isn't a copy-paste of the last cycle.",
      sentiment: "negative" as SentimentFilter,
      source: "Reddit (u/HoldTheDip69)"
    },
    {
      text: "The fear around AI tokens is overblown. AI is here to stay, and the projects that integrate real machine learning solutions will thrive. Long-term holders will win.",
      sentiment: "positive" as SentimentFilter,
      source: "Reddit (u/AIbeliever)"
    }
  ];
  
  const aiInsights = [
    "Regulatory concerns dominate the conversation, with 42% of negative sentiment focused on potential SEC actions against AI token projects.",
    "There's a significant disconnect between AI technology enthusiasm and skepticism about current token implementations.",
    "Market sentiment indicates rotation away from pure AI narrative tokens toward projects with demonstrable utility and revenue models.",
    "Institutional investors appear to be taking short-term positions rather than viewing current AI tokens as long-term investments.",
    "Community sentiment shifts positively when projects demonstrate transparent tokenomics and real machine learning applications."
  ];
  
  const trendsAnalysis = [
    "Recent news headlines about SEC investigations have triggered a 15% increase in negative sentiment over the past week.",
    "The term \"utility\" appears 3x more frequently in discussions compared to two months ago, indicating growing demand for practical use cases.",
    "Social media analysis shows Base Chain projects maintaining better sentiment scores than other ecosystems.",
    "Recent market rotation has shifted approximately $430M from AI tokens to RWA narratives according to on-chain analytics."
  ];
  
  return {
    topTopics,
    sentimentBreakdown,
    exampleQuotes,
    keyPhrases,
    aiInsights,
    trendsAnalysis,
    reportGeneratedAt: new Date().toISOString(),
    newsHeadlines: [
      {
        title: "SEC Investigates AI-Backed Crypto Projects for Misleading Claims",
        source: "CoinDesk",
        date: "March 4, 2025",
        sentiment: "negative" as SentimentFilter
      },
      {
        title: "AI Crypto Boom: Hype or Reality? Analysts Weigh In",
        source: "Decrypt",
        date: "March 3, 2025",
        sentiment: "neutral" as SentimentFilter
      },
      {
        title: "AI Tokens See 40% Drop as Market Rotation Moves to RWA Narrative",
        source: "The Block",
        date: "March 2, 2025",
        sentiment: "negative" as SentimentFilter
      },
      {
        title: "Base Chain Sees AI Token Growth Despite Market Fears",
        source: "Bankless",
        date: "March 1, 2025",
        sentiment: "positive" as SentimentFilter
      }
    ],
    personaAnalysis: [
      {
        persona: "The Institutional Trader",
        analysis: "AI tokens still have runway, but investors are wary. Most large funds are treating them as a short-term play unless tangible revenue streams appear.",
        sentiment: "neutral" as SentimentFilter
      },
      {
        persona: "The Crypto DeFi Builder",
        analysis: "The real challenge for AI tokens isn't tech—it's tokenomics. If there's no value capture mechanism, traders will exit as fast as they entered.",
        sentiment: "negative" as SentimentFilter
      },
      {
        persona: "The Retail Holder",
        analysis: "I like AI projects but don't fully understand how they work. I'll keep holding if the community stays strong.",
        sentiment: "positive" as SentimentFilter
      }
    ],
    actionableInsights: [
      "For Traders: Watch for signs of real adoption vs. short-term narratives before entering new AI token positions.",
      "For AI Projects: Build real utility & revenue models to sustain investor confidence beyond the hype cycle.",
      "For Long-Term Investors: Diversify across AI protocols that demonstrate tangible business models."
    ],
    relatedTopics: [
      "Are AI tokens fundamentally different from other L1/L2 ecosystems?",
      "Which AI projects are securing real enterprise partnerships?",
      "How do AI-focused DAOs compare to traditional VC-funded projects?"
    ]
  };
}

// Fallback to generate mock results if API calls fail
export function generateMockResults(query: ResearchQuery): AnalysisResults {
  const topTopics = generateMockData(query, "topics");
  const sentimentBreakdown = generateSentimentBreakdown(query);
  const exampleQuotes = generateMockData(query, "quotes");
  const keyPhrases = generateMockData(query, "keywords");
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

// Generate data based on type and query
function generateMockData(query: ResearchQuery, type: "topics" | "quotes" | "keywords"): any {
  const queryText = query.query.toLowerCase();
  const isZelenskyy = queryText.includes("zelenskyy") || queryText.includes("ukraine");
  
  if (type === "topics") {
    return isZelenskyy ? 
      [
        "International aid negotiations",
        "Domestic political challenges",
        "War strategy developments"
      ] :
      getTopicsByDomain(queryText);
  }
  
  if (type === "quotes") {
    return isZelenskyy ? 
      getZelenskyyQuotes(query) : 
      getQuotesByDomain(query);
  }
  
  if (type === "keywords") {
    const baseKeywords = ["adoption", "implementation", "community feedback", "future development"];
    
    if (isZelenskyy) {
      return [
        "diplomatic initiatives", "battlefield strategy", "international support",
        "NATO cooperation", "domestic politics", "reconstruction efforts",
        "defense funding", "civilian resilience"
      ];
    }
    
    return [
      ...baseKeywords,
      ...getKeywordsByDomain(queryText)
    ];
  }
  
  return [];
}

// Generate sentiment breakdown based on query
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

// Get domain-specific topics
function getTopicsByDomain(queryText: string): string[] {
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

// Get Zelenskyy-specific quotes
function getZelenskyyQuotes(query: ResearchQuery): QuoteData[] {
  const sources = getSources(query);
  return [
    {
      text: "President Zelenskyy's diplomatic efforts have been crucial in maintaining international support during this critical phase of the conflict.",
      sentiment: "positive" as SentimentFilter,
      source: sources[Math.floor(Math.random() * sources.length)]
    },
    {
      text: "The administration faces growing challenges balancing war efforts with domestic economic concerns, which will be a key factor going forward.",
      sentiment: "neutral" as SentimentFilter,
      source: sources[Math.floor(Math.random() * sources.length)]
    },
    {
      text: "Critics argue that the timeline promised for military advances has repeatedly been missed, raising questions about strategic planning.",
      sentiment: "negative" as SentimentFilter,
      source: sources[Math.floor(Math.random() * sources.length)]
    }
  ];
}

// Get domain-specific quotes
function getQuotesByDomain(query: ResearchQuery): QuoteData[] {
  const sources = getSources(query);
  const queryText = query.query.toLowerCase();
  const quotes: QuoteData[] = [];
  
  // Positive quote
  if (query.sentiment === "all" || query.sentiment === "positive") {
    quotes.push({
      text: queryText.includes("token") || queryText.includes("staking") ?
        "I've been staking my tokens for 3 months and the rewards have been consistent and higher than expected." :
        "This innovation is exactly what the industry needed. I'm seeing significant benefits already.",
      sentiment: "positive" as SentimentFilter,
      source: sources[Math.floor(Math.random() * sources.length)]
    });
  }
  
  // Neutral quote
  if (query.sentiment === "all" || query.sentiment === "neutral") {
    quotes.push({
      text: queryText.includes("token") || queryText.includes("staking") ?
        "The security of these new staking platforms is still unproven. I'm waiting to see more audits." :
        "There are both pros and cons to this approach. We need more data before making definitive judgments.",
      sentiment: "neutral" as SentimentFilter,
      source: sources[Math.floor(Math.random() * sources.length)]
    });
  }
  
  // Negative quote
  if (query.sentiment === "all" || query.sentiment === "negative") {
    quotes.push({
      text: queryText.includes("token") || queryText.includes("staking") ?
        "Regulatory uncertainty makes me hesitant to lock up my assets in staking contracts for long periods." :
        "I've been disappointed by the results so far. The promised benefits aren't materializing as expected.",
      sentiment: "negative" as SentimentFilter,
      source: sources[Math.floor(Math.random() * sources.length)]
    });
  }
  
  return quotes;
}

// Get domain-specific keywords
function getKeywordsByDomain(queryText: string): string[] {
  if (queryText.includes("token") || queryText.includes("staking")) {
    return [
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
      "floor price", 
      "rarity attributes", 
      "royalty payments", 
      "secondary markets", 
      "utility features", 
      "authenticating ownership"
    ];
  } else {
    return [
      "technical integration", 
      "user experience", 
      "security features", 
      "competitive advantage", 
      "market timing", 
      "innovation factors"
    ];
  }
}

// Get sources based on query
function getSources(query: ResearchQuery): string[] {
  const sourceList = query.sources.includes("all") 
    ? ["Twitter", "Reddit", "News"] 
    : query.sources.map(s => s.charAt(0).toUpperCase() + s.slice(1));
  
  return sourceList;
}
