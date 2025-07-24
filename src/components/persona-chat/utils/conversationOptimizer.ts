import { Message } from '../types';

/**
 * Optimizes conversation history for better performance while maintaining context
 */
export class ConversationOptimizer {
  private static readonly MAX_HISTORY_TOKENS = 800; // Conservative token limit
  private static readonly ESSENTIAL_MESSAGES = 4; // Always keep the most recent messages
  
  /**
   * Optimizes conversation history by keeping essential context while reducing token usage
   */
  static optimizeHistory(messages: Message[]): Message[] {
    if (messages.length <= this.ESSENTIAL_MESSAGES) {
      return messages;
    }

    // Always keep the most recent messages for immediate context
    const recentMessages = messages.slice(-this.ESSENTIAL_MESSAGES);
    
    // If we have more messages, try to include earlier important ones
    if (messages.length > this.ESSENTIAL_MESSAGES) {
      const earlierMessages = messages.slice(0, -this.ESSENTIAL_MESSAGES);
      const importantEarlier = this.selectImportantMessages(earlierMessages, 4);
      
      // Combine important earlier messages with recent ones
      return [...importantEarlier, ...recentMessages];
    }
    
    return recentMessages;
  }

  /**
   * Selects the most important messages from a conversation based on various criteria
   */
  private static selectImportantMessages(messages: Message[], maxCount: number): Message[] {
    // Score messages based on importance factors
    const scoredMessages = messages.map((message, index) => ({
      message,
      score: this.calculateMessageImportance(message, index, messages.length)
    }));

    // Sort by score and take the top messages
    return scoredMessages
      .sort((a, b) => b.score - a.score)
      .slice(0, maxCount)
      .map(item => item.message)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)); // Restore chronological order
  }

  /**
   * Calculates the importance score of a message
   */
  private static calculateMessageImportance(message: Message, index: number, totalMessages: number): number {
    let score = 0;

    // Length factor - longer messages might contain more context
    score += Math.min(message.content.length / 100, 3);

    // Position factor - earlier messages in conversation are often important
    if (index < 3) {
      score += 2;
    }

    // Question factor - questions are often important for context
    if (message.content.includes('?')) {
      score += 1;
    }

    // Image factor - messages with images are often important
    if (message.image) {
      score += 2;
    }

    // User messages are generally more important than assistant messages for context
    if (message.role === 'user') {
      score += 1;
    }

    return score;
  }

  /**
   * Estimates token count for a message (rough approximation)
   */
  static estimateTokens(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  /**
   * Checks if the conversation history is within token limits
   */
  static isWithinTokenLimit(messages: Message[]): boolean {
    const totalTokens = messages.reduce((sum, msg) => 
      sum + this.estimateTokens(msg.content), 0
    );
    return totalTokens <= this.MAX_HISTORY_TOKENS;
  }
}
