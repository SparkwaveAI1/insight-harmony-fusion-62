
import { ResearchQuery } from "../types/qualitativeAnalysisTypes";

// Generate AI insights based on collected data
export function generateAIInsights(topics: string[], sentimentBreakdown: any, keyPhrases: string[], query: ResearchQuery): string[] {
  const insights: string[] = [];
  
  // Analyze sentiment distribution
  if (sentimentBreakdown.positive > 60) {
    insights.push(`There is a strong positive sentiment (${sentimentBreakdown.positive}%) around "${query.query}", indicating general approval or excitement in the community.`);
  } else if (sentimentBreakdown.negative > 60) {
    insights.push(`There is significant negative sentiment (${sentimentBreakdown.negative}%) surrounding "${query.query}", suggesting potential concerns or criticism that should be addressed.`);
  } else if (sentimentBreakdown.neutral > 60) {
    insights.push(`The high neutral sentiment (${sentimentBreakdown.neutral}%) around "${query.query}" indicates either a lack of strong opinions or a balanced view of pros and cons.`);
  } else {
    insights.push(`The sentiment around "${query.query}" is mixed, with ${sentimentBreakdown.positive}% positive, ${sentimentBreakdown.neutral}% neutral, and ${sentimentBreakdown.negative}% negative opinions, suggesting a complex and nuanced topic.`);
  }
  
  // Topic-based insights
  if (topics.length > 0) {
    insights.push(`The most prominent theme emerging from the data is "${topics[0]}", which appears frequently in discussions about "${query.query}".`);
    
    // Add specific insights based on top topic
    if (topics[0].includes("Regulatory")) {
      insights.push("Consider monitoring regulatory developments closely as they appear to be a significant factor in current discussions.");
    } else if (topics[0].includes("Security")) {
      insights.push("Security considerations are at the forefront of current discussions, which may warrant additional focus on demonstrating security measures.");
    } else if (topics[0].includes("Adoption")) {
      insights.push("Current conversations highlight challenges in adoption, suggesting a need to address barriers to entry or improve user onboarding processes.");
    }
  }
  
  // Keyword-based insights
  if (keyPhrases.length > 3) {
    insights.push(`Key terminology frequently associated with "${query.query}" includes "${keyPhrases.slice(0, 3).join('", "')}", which could be important for messaging alignment.`);
  }
  
  // Source-specific insights
  if (query.sources.includes("twitter") || query.sources.includes("all")) {
    insights.push("Social media conversations tend to focus on immediate reactions and emerging trends, providing early signals of shifting sentiments.");
  }
  if (query.sources.includes("news") || query.sources.includes("all")) {
    insights.push("News coverage offers a more structured narrative that may influence broader public perception and formal discourse.");
  }
  
  // AI recommendation
  insights.push(`Based on the collected data, we recommend focusing communication on ${sentimentBreakdown.positive > sentimentBreakdown.negative ? "the positive aspects while addressing specific concerns" : "addressing the prevalent concerns while highlighting positive developments"} related to "${query.query}".`);
  
  return insights;
}

// Generate trends analysis
export function generateTrendsAnalysis(sentimentBreakdown: any, topics: string[], query: ResearchQuery): string {
  let analysis = `## Trend Analysis for "${query.query}"\n\n`;
  
  // Sentiment trend analysis
  analysis += "### Sentiment Trends\n";
  if (sentimentBreakdown.positive > sentimentBreakdown.negative) {
    analysis += `The overall sentiment is leaning positive (${sentimentBreakdown.positive}%), which suggests favorable reception. `;
    analysis += `This positive trend indicates potential opportunities for growth and expansion in related areas.\n\n`;
  } else if (sentimentBreakdown.negative > sentimentBreakdown.positive) {
    analysis += `The overall sentiment is leaning negative (${sentimentBreakdown.negative}%), which suggests there are concerns or criticisms that need addressing. `;
    analysis += `This negative trend may indicate potential risks or challenges that should be monitored closely.\n\n`;
  } else {
    analysis += `The sentiment is relatively balanced, which suggests a mature discourse with recognized pros and cons. `;
    analysis += `This balanced trend indicates a nuanced understanding of the topic among the audience.\n\n`;
  }
  
  // Topic trend analysis
  analysis += "### Topic Trends\n";
  if (topics.length > 0) {
    analysis += `The emerging topics (${topics.slice(0, 3).join(", ")}) suggest that the conversation is primarily focused on `;
    
    if (topics.some(t => t.includes("Regulatory") || t.includes("Security"))) {
      analysis += "risk factors and governance aspects. This indicates a maturing market that is becoming increasingly concerned with sustainability and compliance.\n\n";
    } else if (topics.some(t => t.includes("Adoption") || t.includes("Community"))) {
      analysis += "user engagement and practical applications. This suggests the market is in a growth phase with emphasis on expanding the user base.\n\n";
    } else if (topics.some(t => t.includes("Technology") || t.includes("Future"))) {
      analysis += "innovation and development roadmaps. This indicates a forward-looking community focused on technological advancement.\n\n";
    } else {
      analysis += "various aspects of implementation and impact. This suggests a diverse range of interests and concerns within the community.\n\n";
    }
  }
  
  // Timeframe-based analysis
  analysis += "### Timeline Projection\n";
  switch (query.timeFrame) {
    case "real-time":
      analysis += "The real-time data captures immediate reactions which may be volatile but provides early indicators of potential issues or opportunities that could develop in the coming days.\n\n";
      break;
    case "short-term":
      analysis += "The short-term trend over the past week shows a snapshot of current conversations that may be influenced by recent events or announcements, providing context for near-term planning.\n\n";
      break;
    case "medium-term":
      analysis += "The medium-term analysis over the past month reveals more sustained patterns of discussion that can inform strategic adjustments over the coming quarter.\n\n";
      break;
    case "long-term":
      analysis += "The long-term perspective over several months highlights enduring themes and concerns that should be addressed in long-range planning and positioning.\n\n";
      break;
  }
  
  // AI-powered recommendation
  analysis += "### AI-Powered Recommendation\n";
  analysis += "Based on the pattern analysis performed by our AI system, we recommend:\n\n";
  
  if (sentimentBreakdown.positive > 50) {
    analysis += "1. Leverage the positive sentiment by amplifying success stories and case studies\n";
    analysis += "2. Address the minority concerns proactively to maintain the positive momentum\n";
    analysis += "3. Consider expanding into adjacent areas where the positive reception may transfer\n";
  } else if (sentimentBreakdown.negative > 50) {
    analysis += "1. Directly address the top concerns identified in the negative sentiments\n";
    analysis += "2. Highlight planned improvements or corrections related to the criticism\n";
    analysis += "3. Engage with critics constructively to demonstrate responsiveness\n";
  } else {
    analysis += "1. Clarify your position on the topics generating mixed reactions\n";
    analysis += "2. Emphasize the positive aspects while acknowledging legitimate concerns\n";
    analysis += "3. Provide more educational content to help audiences form informed opinions\n";
  }
  
  return analysis;
}
