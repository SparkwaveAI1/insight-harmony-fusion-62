
export async function generateChatResponse(
  messages: any[], 
  apiKey: string, 
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    max_completion_tokens?: number;
  }
): Promise<any> {
  // Handle parameter differences between model versions
  const isNewerModel = options?.model?.includes('gpt-5') || options?.model?.includes('o3') || options?.model?.includes('o4');
  
  const requestBody: any = {
    model: options?.model || 'gpt-4.1-2025-04-14',
    messages,
  };

  // Add temperature only for models that support it
  if (!isNewerModel && options?.temperature !== undefined) {
    requestBody.temperature = options.temperature;
  }

  // Use correct token parameter based on model
  if (options?.max_completion_tokens && isNewerModel) {
    requestBody.max_completion_tokens = options.max_completion_tokens;
  } else if (options?.max_tokens) {
    requestBody.max_tokens = options.max_tokens;
  } else {
    requestBody.max_tokens = 2000; // Default fallback
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  return response.json();
}
