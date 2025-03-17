
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

  console.log(`Transcribing audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

  if (audioBlob.size === 0) {
    console.error('Empty audio blob received for transcription');
    toast.error('No audio data to transcribe. Please check your microphone.');
    return { text: '[No audio data to transcribe]' };
  }

  const formData = new FormData();
  
  let filename = 'recording.webm';
  if (audioBlob.type.includes('mp3')) {
    filename = 'recording.mp3';
  } else if (audioBlob.type.includes('wav')) {
    filename = 'recording.wav';
  }
  
  formData.append('file', audioBlob, filename);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'json');
  formData.append('language', 'en'); // Optional: specify language

  try {
    console.log(`Sending transcription request with ${filename}`);
    console.log(`Using API key (first 5 chars): ${apiKey.substring(0, 5)}...`);
    
    const response = await fetch(`${OPENAI_API_ENDPOINT}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    // Log the response status and headers for debugging
    console.log(`Transcription API response status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = 'Failed to transcribe audio';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        console.error('Transcription API error:', errorData);
      } catch (parseError) {
        console.error('Error parsing API error response:', parseError);
        console.error('Raw response:', await response.text().catch(() => 'Unable to get response text'));
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Transcription result:', result);
    
    if (!result.text || result.text.trim() === '') {
      console.warn('Empty transcription received from API');
      return { text: '[No speech detected]' };
    }
    
    return result;
  } catch (error) {
    console.error('Transcription error:', error);
    toast.error('Failed to transcribe audio. Please try again.');
    return { text: error instanceof Error ? `[Transcription failed: ${error.message}]` : '[Transcription failed]' };
  }
}

export async function generateResponse(messages: { role: string, content: string }[]): Promise<string> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    toast.error('OpenAI API key is required for AI responses');
    return "I'm sorry, I can't generate a response right now. Please check your API key settings.";
  }

  console.log(`Using API key for chat (first 5 chars): ${apiKey.substring(0, 5)}...`);

  try {
    console.log('Sending chat request to OpenAI API');
    
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
    
    // Log the response status for debugging
    console.log(`Chat API response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = 'Failed to generate response';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        console.error('Chat API error:', errorData);
      } catch (parseError) {
        console.error('Error parsing API error response:', parseError);
        console.error('Raw response:', await response.text().catch(() => 'Unable to get response text'));
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Response generation error:', error);
    toast.error('Failed to generate AI response. Please try again.');
    return "I'm sorry, I couldn't process your response right now. Let's try again.";
  }
}
