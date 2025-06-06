
export async function callOpenAIValidation(prompt: string, openaiApiKey: string): Promise<string> {
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a harsh authenticity validator specializing in human conversation patterns and personality psychology. Your job is to ensure each persona sounds like a REAL PERSON talking naturally while expressing DISTINCT opinions based on their specific personality traits. Most responses should fail validation for being too polished, AI-like, or not reflecting natural human speech. Be extremely critical of anything that sounds like written content rather than spoken conversation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
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
