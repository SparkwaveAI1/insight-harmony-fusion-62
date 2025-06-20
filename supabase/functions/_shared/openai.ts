
export async function generateChatResponse(
  messages: any[], 
  apiKey: string, 
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options?.model || 'gpt-4.1-2025-04-14',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  return response.json();
}
