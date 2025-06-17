/**
 * Utility functions for handling chat messages
 */

/**
 * Breaks long responses into multiple sequential messages
 * @param responseText The full text response to break up
 * @returns Array of message segments
 */
export const breakIntoMultipleMessages = (responseText: string): string[] => {
  // If response is already short, return as is
  if (responseText.length < 100) return [responseText];
  
  // Split by paragraphs first
  const paragraphs = responseText.split(/\n\n+/);
  
  // If we have multiple paragraphs, use those as separate messages
  if (paragraphs.length > 1) {
    return paragraphs.filter(p => p.trim().length > 0);
  }
  
  // Otherwise, try to find natural breaking points like sentence endings
  const sentences = responseText.match(/[^.!?]+[.!?]+/g) || [responseText];
  
  // If very long sentence, just break by length
  if (sentences.length === 1 && sentences[0].length > 150) {
    const chunks = [];
    let current = '';
    const words = responseText.split(' ');
    
    for (const word of words) {
      if ((current + ' ' + word).length > 100) {
          chunks.push(current);
          current = word;
        } else {
          current += (current ? ' ' : '') + word;
        }
      }
      
      if (current) chunks.push(current);
      return chunks;
    }
    
    // Group sentences into reasonable message sizes
    const messages = [];
    let currentMessage = '';
    
    for (const sentence of sentences) {
      if (currentMessage.length + sentence.length > 150) {
        messages.push(currentMessage);
        currentMessage = sentence;
      } else {
        currentMessage += currentMessage ? ' ' + sentence : sentence;
      }
    }
    
    if (currentMessage) messages.push(currentMessage);
    return messages;
  };
