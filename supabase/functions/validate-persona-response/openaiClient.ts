
export async function callOpenAIValidation(prompt: string, openaiApiKey: string): Promise<string> {
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // OPTIMIZED: Use faster model
      messages: [
        {
          role: 'system',
          content: 'You are a fast persona validator. Check basic facts quickly and return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // OPTIMIZED: Lower temperature for consistency
      max_tokens: 500, // OPTIMIZED: Shorter responses
    }),
  });

  if (!openaiResponse.ok) {
    const errorData = await openaiResponse.json();
    console.error('OpenAI validation error:', errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const openaiData = await openaiResponse.json();
  return openaiData.choices[0].message.content;
}
