
import { getApiKey } from '../utils/apiKeyUtils';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

export interface TranscriptionResponse {
  text: string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.mp3');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'json');

  try {
    const response = await fetch(`${OPENAI_API_ENDPOINT}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to transcribe audio');
    }

    return await response.json();
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

export async function generateResponse(messages: { role: string, content: string }[]): Promise<string> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  try {
    const response = await fetch(`${OPENAI_API_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI interviewer collecting information about users to create personas. Ask follow-up questions based on their responses.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Response generation error:', error);
    throw error;
  }
}
