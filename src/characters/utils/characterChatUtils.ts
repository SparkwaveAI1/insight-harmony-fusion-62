
export const breakIntoMultipleMessages = (response: string): string[] => {
  // Split long responses into smaller segments for natural conversation flow
  const sentences = response.split(/(?<=[.!?])\s+/);
  const segments: string[] = [];
  let currentSegment = '';
  
  for (const sentence of sentences) {
    if (currentSegment.length + sentence.length > 200 && currentSegment.length > 0) {
      segments.push(currentSegment.trim());
      currentSegment = sentence;
    } else {
      currentSegment += (currentSegment ? ' ' : '') + sentence;
    }
  }
  
  if (currentSegment.trim()) {
    segments.push(currentSegment.trim());
  }
  
  return segments.length > 0 ? segments : [response];
};
