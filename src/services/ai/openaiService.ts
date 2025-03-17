
import { getApiKey } from '../utils/apiKeyUtils';
import { toast } from 'sonner';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

export interface TranscriptionResponse {
  text: string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    console.error('OpenAI API key is missing');
    toast.error('OpenAI API key is required for transcription');
    return { text: '[Transcription unavailable - API key missing]' };
  }

  console.log(`Transcribing audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

  if (audioBlob.size === 0) {
    console.error('Empty audio blob received for transcription');
    toast.error('No audio data to transcribe. Please check your microphone.');
    return { text: '[No audio data to transcribe]' };
  }

  if (audioBlob.size < 1000) {
    console.warn('Very small audio blob received, might not contain enough data to transcribe');
    toast.warning('Audio recording appears to be too short. Please speak longer and more clearly.');
    return { text: '[Audio recording too short]' };
  }

  // Create a clean, optimized FormData object
  const formData = new FormData();
  
  // Determine appropriate filename based on MIME type
  let filename = 'recording.webm';
  if (audioBlob.type.includes('mp3')) {
    filename = 'recording.mp3';
  } else if (audioBlob.type.includes('wav')) {
    filename = 'recording.wav';
  }
  
  // Create a clean copy of the blob to avoid potential issues
  const cleanBlob = new Blob([await audioBlob.arrayBuffer()], { type: audioBlob.type });
  formData.append('file', cleanBlob, filename);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'json');
  formData.append('language', 'en');

  try {
    console.log(`START TRANSCRIPTION: Sending request to OpenAI for ${filename}, size: ${cleanBlob.size} bytes`);
    console.log(`Using API key (first 5 chars): ${apiKey.substring(0, 5)}...`);
    
    // Additional logging to verify request details
    const formDataEntries = Array.from(formData.entries()).map(entry => {
      if (entry[0] === 'file') {
        return [entry[0], `[File: ${(entry[1] as File).size} bytes]`];
      }
      return entry;
    });
    console.log('FormData entries:', Object.fromEntries(formDataEntries as [string, string][]));

    // Make the API request with proper error handling
    const response = await fetch(`${OPENAI_API_ENDPOINT}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    // Log the response status and headers for debugging
    console.log(`TRANSCRIPTION RESPONSE: Status: ${response.status}`);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      let errorMessage = 'Failed to transcribe audio';
      let errorDetails = '';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        errorDetails = JSON.stringify(errorData);
        console.error('TRANSCRIPTION ERROR:', errorData);
        
        // Check for common issues
        if (response.status === 401) {
          toast.error('API key is invalid or expired. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else {
          toast.error(`Transcription failed: ${errorMessage}`);
        }
      } catch (parseError) {
        console.error('Error parsing API error response:', parseError);
        const rawText = await response.text().catch(() => 'Unable to get response text');
        console.error('Raw response:', rawText);
        errorDetails = rawText;
        toast.error('Failed to transcribe speech. Check console for details.');
      }
      
      throw new Error(`${errorMessage}\nDetails: ${errorDetails}`);
    }

    const result = await response.json();
    console.log('TRANSCRIPTION SUCCESS: Result:', result);
    
    if (!result.text || result.text.trim() === '') {
      console.warn('Empty transcription received from API');
      toast.warning('No speech detected. Please speak more clearly or check your microphone.');
      return { text: '[No speech detected]' };
    }
    
    // Show success message
    toast.success(`Speech detected: "${result.text.substring(0, 30)}${result.text.length > 30 ? '...' : ''}"`);
    return result;
  } catch (error) {
    console.error('TRANSCRIPTION ERROR:', error);
    toast.error('Failed to transcribe audio. Please try again.');
    return { text: error instanceof Error ? `[Transcription failed: ${error.message}]` : '[Transcription failed]' };
  }
}

export async function generateResponse(messages: { role: string, content: string }[]): Promise<string> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    console.error('OpenAI API key is missing');
    toast.error('OpenAI API key is required for AI responses');
    return "I'm sorry, I can't generate a response right now. Please check your API key settings.";
  }

  console.log(`START GENERATING RESPONSE: Using API key (first 5 chars): ${apiKey.substring(0, 5)}...`);
  console.log('Sending messages to OpenAI:', JSON.stringify(messages, null, 2));

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
    console.log(`CHAT RESPONSE: Status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = 'Failed to generate response';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        console.error('CHAT ERROR:', errorData);
        
        // Check for common issues
        if (response.status === 401) {
          toast.error('API key is invalid or expired. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else {
          toast.error(`AI response failed: ${errorMessage}`);
        }
      } catch (parseError) {
        console.error('Error parsing API error response:', parseError);
        console.error('Raw response:', await response.text().catch(() => 'Unable to get response text'));
        toast.error('Failed to generate AI response. Check console for details.');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('CHAT SUCCESS: OpenAI response:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('CHAT ERROR: Response generation error:', error);
    toast.error('Failed to generate AI response. Please try again.');
    return "I'm sorry, I couldn't process your response right now. Let's try again.";
  }
}
