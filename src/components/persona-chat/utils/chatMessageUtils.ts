/**
 * Utility functions for handling chat messages
 */

/**
 * Breaks long responses into multiple sequential messages
 * @param responseText The full text response to break up
 * @returns Array of message segments
 */
export { MessageFormattingService } from '@/services/messageFormattingService';

// Keep the original function name for existing code
export const breakIntoMultipleMessages = (responseText: string): string[] => {
  return MessageFormattingService.breakIntoMultipleMessages(responseText);
};
