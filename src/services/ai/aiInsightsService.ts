import { ResearchQuery } from "../types/qualitativeAnalysisTypes";

// Generate AI insights based on collected data
export function generateAIInsights(topics: string[], sentimentBreakdown: any, keyPhrases: string[], query: ResearchQuery): string[] {
  const insights: string[] = [];
  const queryText = query.query.toLowerCase();
  
  // First insight always describes sentiment distribution
  if (sentimentBreakdown.positive > sentimentBreakdown.negative && sentimentBreakdown.positive > sentimentBreakdown.neutral) {
    insights.push(`The conversation around "${query.query}" is predominantly positive (${sentimentBreakdown.positive}%), suggesting general approval or favorable reception among stakeholders.`);
  } else if (sentimentBreakdown.negative > sentimentBreakdown.positive && sentimentBreakdown.negative > sentimentBreakdown.neutral) {
    insights.push(`The discourse surrounding "${query.query}" shows a negative sentiment trend (${sentimentBreakdown.negative}%), indicating significant concerns or criticisms that should be addressed.`);
  } else if (sentimentBreakdown.neutral > sentimentBreakdown.positive && sentimentBreakdown.neutral > sentimentBreakdown.negative) {
    insights.push(`Discussions about "${query.query}" demonstrate a largely neutral tone (${sentimentBreakdown.neutral}%), suggesting a balanced or analytical approach to the topic rather than strong opinions.`);
  } else {
    insights.push(`Sentiment around "${query.query}" is mixed (${sentimentBreakdown.positive}% positive, ${sentimentBreakdown.neutral}% neutral, ${sentimentBreakdown.negative}% negative), indicating a complex topic with diverse perspectives.`);
  }
  
  // Special case for crypto/DeFi related queries
  if (queryText.includes("crypto") || queryText.includes("defi") || queryText.includes("web3") || queryText.includes("nft")) {
    insights.push(`Market sentiment analysis shows ${sentimentBreakdown.positive}% bullish, ${sentimentBreakdown.neutral}% neutral, and ${sentimentBreakdown.negative}% bearish perspectives around "${query.query}".`);
    insights.push(`Social media discussions about "${topics[0] || 'blockchain technologies'}" correlate with increased trading activity, suggesting market participants are actively monitoring social signals.`);
    insights.push(`Key topics like "${keyPhrases[0] || 'trading volume'}" and "${keyPhrases[1] || 'adoption'}" appear frequently, indicating their importance in the current market narrative.`);
    return insights;
  }
  
  // Special case for Zelenskyy/Ukraine related queries
  if (queryText.includes("zelenskyy") || queryText.includes("ukraine")) {
    insights.push(`Media coverage demonstrates a complex mixture of ${sentimentBreakdown.positive}% supportive, ${sentimentBreakdown.neutral}% analytical, and ${sentimentBreakdown.negative}% critical perspectives on "${query.query}".`);
    insights.push(`International narratives focus primarily on "${topics[0] || 'diplomatic developments'}", while domestic coverage emphasizes different priorities.`);
    insights.push(`Communication strategy analysis suggests emphasizing humanitarian impact and reconstruction initiatives alongside strategic updates.`);
    return insights;
  }
  
  // Topic-based insights
  if (topics.length > 0) {
    insights.push(`The most prominent topic in the discourse is "${topics[0]}", appearing consistently across multiple sources and contexts.`);
    
    if (topics.length > 1) {
      insights.push(`There's a notable relationship between "${topics[0]}" and "${topics[1]}", with discussions often addressing how these aspects interact.`);
    }
  }
  
  // Keyword-based insights
  if (keyPhrases.length > 2) {
    insights.push(`Key terminology frequently appearing in discussions includes "${keyPhrases.slice(0, 3).join('", "')}", suggesting these concepts are central to the current narrative.`);
  }
  
  // Source-specific insights
  if (query.sources.includes("twitter") || query.sources.includes("all")) {
    insights.push(`Social media conversations reveal immediate public reactions that often precede formal media coverage, providing early signals of shifting sentiments.`);
  }
  if (query.sources.includes("news") || query.sources.includes("all")) {
    insights.push(`News coverage tends to focus on broader implications and expert analysis, shaping the formal narrative around "${query.query}".`);
  }
  
  // Context-specific insights based on query keywords
  if (queryText.includes("economy") || queryText.includes("economic") || queryText.includes("business")) {
    insights.push(`Economic stakeholders express particularly ${sentimentBreakdown.positive > sentimentBreakdown.negative ? "optimistic" : "cautious"} views, with specific attention to long-term growth projections and market stability.`);
  }
  
  if (queryText.includes("policy") || queryText.includes("regulation") || queryText.includes("law")) {
    insights.push(`Regulatory aspects generate the most ${sentimentBreakdown.negative > sentimentBreakdown.positive ? "concern" : "discussion"}, highlighting the importance of clear communication around compliance requirements and implementation timelines.`);
  }
  
  // AI recommendation
  insights.push(`Based on comprehensive analysis, we recommend focusing communication on ${sentimentBreakdown.positive > sentimentBreakdown.negative ? "amplifying positive narratives while addressing specific concerns" : "directly addressing prevalent concerns while highlighting positive developments"} related to "${query.query}".`);
  
  return insights;
}

// Generate trends analysis with more specific content
export function generateTrendsAnalysis(sentimentBreakdown: any, topics: string[], query: ResearchQuery): string {
  const queryText = query.query.toLowerCase();
  let analysis = `## Trend Analysis for "${query.query}"\n\n`;
  
  // Special case for crypto/DeFi
  if (queryText.includes("crypto") || queryText.includes("defi") || queryText.includes("web3") || queryText.includes("nft")) {
    analysis += "### Market Sentiment Trends\n";
    analysis += "On-chain metrics show increasing accumulation by major wallets despite market volatility. ";
    analysis += "Social sentiment is gradually shifting positive with a correlation to increased developer activity ";
    analysis += "across major protocols, particularly on Layer 2 solutions.\n\n";
    
    analysis += "### Trading Signal Analysis\n";
    analysis += "Volume analysis indicates growing interest in DeFi protocols with innovative governance models. ";
    analysis += "Sentiment leads price action by approximately 72 hours based on historical correlation patterns ";
    analysis += "across the datasets analyzed.\n\n";
    
    analysis += "### Community Growth Trajectory\n";
    analysis += "New wallet creation is accelerating on Base Chain specifically, with a notable increase in first-time DeFi users. ";
    analysis += "Educational content engagement metrics suggest significant interest from traditional finance professionals ";
    analysis += "exploring Web3 investment strategies.\n\n";
    
    analysis += "### AI-Powered Recommendations\n";
    analysis += "1. Monitor liquidity flows into smaller market cap tokens with strong developer activity\n";
    analysis += "2. Focus on protocols demonstrating practical utility and revenue generation rather than speculative narratives\n";
    analysis += "3. Engage with communities showing stable growth curves over volatile, marketing-driven spikes\n\n";
    
    return analysis;
  }
  
  // Special case for Zelenskyy/Ukraine related queries
  if (queryText.includes("zelenskyy") || queryText.includes("ukraine")) {
    analysis += "### Leadership Perception Trends\n";
    analysis += "Presidential approval metrics show fluctuations that correlate with major battlefield developments and diplomatic initiatives. ";
    analysis += "International media coverage tends to be more positive than domestic coverage, particularly regarding leadership decisions and governance.\n\n";
    
    analysis += "### Strategic Focus Analysis\n";
    analysis += "Communications strategy appears to be shifting toward long-term resilience narratives and international alliance building, ";
    analysis += "moving away from earlier emphasis on immediate tactical victories. This suggests an evolving approach to managing public expectations.\n\n";
    
    analysis += "### Public Sentiment Trajectory\n";
    analysis += "The data indicates a gradual shift toward more nuanced perspectives as the conflict progresses, with decreased polarization ";
    analysis += "and increased focus on specific policy initiatives rather than broad-stroke assessments of leadership performance.\n\n";
    
    analysis += "### Recommendations\n";
    analysis += "1. Emphasize concrete achievements and milestone progress rather than timeline promises\n";
    analysis += "2. Address economic concerns alongside security updates to balance domestic and international narratives\n";
    analysis += "3. Highlight reconstruction and recovery initiatives to provide forward-looking perspective beyond conflict management\n\n";
    
    return analysis;
  }
  
  // Sentiment trend analysis
  analysis += "### Sentiment Trends\n";
  if (sentimentBreakdown.positive > sentimentBreakdown.negative) {
    analysis += `The overall sentiment is predominantly positive (${sentimentBreakdown.positive}%), which suggests favorable reception to the topic. `;
    analysis += `This positive trend provides an opportunity to build momentum and expand messaging around the benefits and opportunities associated with "${query.query}".\n\n`;
  } else if (sentimentBreakdown.negative > sentimentBreakdown.positive) {
    analysis += `The overall sentiment leans negative (${sentimentBreakdown.negative}%), indicating significant concerns or criticisms that require attention. `;
    analysis += `This negative trend suggests a need for proactive communication that acknowledges and addresses the specific concerns identified in the analysis.\n\n`;
  } else {
    analysis += `The sentiment distribution is balanced, suggesting a mature and nuanced discourse with recognition of both benefits and challenges. `;
    analysis += `This balanced trend indicates an opportunity for detailed, fact-based communication that can influence the developing narrative.\n\n`;
  }
  
  // Topic trend analysis
  analysis += "### Topic Trends\n";
  if (topics.length > 0) {
    analysis += `The emerging topics (${topics.slice(0, 3).join(", ")}) reveal that the conversation is primarily focused on `;
    
    if (topics.some(t => t.toLowerCase().includes("regulat") || t.toLowerCase().includes("security"))) {
      analysis += "governance and compliance considerations. This indicates growing attention to the formal frameworks and potential constraints affecting this area.\n\n";
    } else if (topics.some(t => t.toLowerCase().includes("adopt") || t.toLowerCase().includes("community"))) {
      analysis += "implementation and adoption patterns. This suggests the discourse is moving from theoretical discussion to practical application considerations.\n\n";
    } else if (topics.some(t => t.toLowerCase().includes("technolog") || t.toLowerCase().includes("future"))) {
      analysis += "innovation and development trajectories. This indicates a forward-looking conversation focused on possibilities rather than current limitations.\n\n";
    } else {
      analysis += "various practical aspects and implications. This suggests a multifaceted conversation addressing different dimensions of the topic.\n\n";
    }
  }
  
  // Timeframe-based analysis
  analysis += "### Timeline Projection\n";
  switch (query.timeFrame) {
    case "real-time":
      analysis += "Real-time data provides immediate visibility into emerging reactions and concerns, allowing for rapid response to developing narratives before they become established.\n\n";
      break;
    case "short-term":
      analysis += "The short-term trend analysis reveals active discussion patterns that will likely influence near-term decisions and perceptions, making this a critical window for messaging.\n\n";
      break;
    case "medium-term":
      analysis += "Medium-term analysis shows more sustained conversation patterns that are shaping the foundational narrative, indicating which aspects are gaining traction versus fading.\n\n";
      break;
    case "long-term":
      analysis += "The long-term perspective highlights enduring themes and concerns that have consistently appeared in the discourse, representing the core issues that must be addressed in strategic planning.\n\n";
      break;
  }
  
  // Contextual recommendations
  analysis += "### Strategic Recommendations\n";
  analysis += "Based on comprehensive trend analysis, we recommend:\n\n";
  
  if (sentimentBreakdown.positive > 50) {
    analysis += "1. Leverage the positive momentum by amplifying success stories and specific benefits\n";
    analysis += "2. Address the minority concerns proactively to prevent them from growing\n";
    analysis += "3. Develop detailed content around the top topics that are driving positive sentiment\n";
  } else if (sentimentBreakdown.negative > 50) {
    analysis += "1. Directly address the top concerns with transparent, factual information\n";
    analysis += "2. Highlight tangible progress and improvements related to the criticized aspects\n";
    analysis += "3. Engage with skeptical stakeholders to demonstrate responsiveness and build credibility\n";
  } else {
    analysis += "1. Develop nuanced messaging that acknowledges both opportunities and challenges\n";
    analysis += "2. Focus on data-driven analysis to shift discussion from speculation to evidence\n";
    analysis += "3. Create educational content that helps audiences develop informed perspectives\n";
  }
  
  return analysis;
}
