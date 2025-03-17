
import { getApiKey } from '../utils/apiKeyUtils';
import { toast } from 'sonner';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

export interface TranscriptionResponse {
  text: string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    toast.error('OpenAI API key is required for transcription');
    return { text: '[Transcription unavailable - API key missing]' };
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
    toast.error('Failed to transcribe audio. Please try again.');
    return { text: '[Transcription failed]' };
  }
}

export async function generateResponse(messages: { role: string, content: string }[]): Promise<string> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    toast.error('OpenAI API key is required for AI responses');
    return "I'm sorry, I can't generate a response right now. Please check your API key settings.";
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
    toast.error('Failed to generate AI response. Please try again.');
    return "I'm sorry, I couldn't process your response right now. Let's try again.";
  }
}
