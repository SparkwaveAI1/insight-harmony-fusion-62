
import { getApiKey } from '../utils/apiKeyUtils';
import { toast } from 'sonner';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${OPENAI_API_ENDPOINT}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}

export async function generateSpeech(text: string): Promise<ArrayBuffer | null> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    toast.error('OpenAI API key is required for text-to-speech');
    return null;
  }

  try {
    console.log('Using API key for text-to-speech (first 5 chars):', apiKey.substring(0, 5) + '...');
    
    const response = await fetch(`${OPENAI_API_ENDPOINT}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'nova',
        input: text
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate speech');
    }

    // Create a fresh copy of the ArrayBuffer to prevent "detached ArrayBuffer" errors
    const buffer = await response.arrayBuffer();
    const copy = buffer.slice(0);
    return copy;
  } catch (error) {
    console.error('Speech generation error:', error);
    toast.error('Failed to generate AI voice. Using text only.');
    return null;
  }
}

export function playAudioBuffer(audioBuffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a fresh copy of the ArrayBuffer to avoid "detached ArrayBuffer" errors
      const bufferCopy = audioBuffer.slice(0);
      
      // Use a standard AudioContext with proper type handling
      const AudioContextClass = window.AudioContext || 
                               ((window as any).webkitAudioContext as typeof AudioContext);
      
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported in this browser');
      }
      
      // Using standard AudioContext
      const audioContext = new AudioContextClass();
      
      console.log('AudioContext created, decoding audio data...');
      
      audioContext.decodeAudioData(
        bufferCopy, 
        (buffer) => {
          try {
            console.log('Audio data decoded successfully, creating source node...');
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            
            source.onended = () => {
              console.log('Audio playback completed');
              resolve();
            };
            
            console.log('Starting audio playback...');
            source.start(0);
            console.log('Audio playback started');
          } catch (err) {
            console.error('Error playing audio:', err);
            reject(err);
          }
        }, 
        (err) => {
          console.error('Error decoding audio:', err);
          reject(err);
        }
      );
    } catch (err) {
      console.error('Error initializing audio context:', err);
      reject(err);
    }
  });
}
