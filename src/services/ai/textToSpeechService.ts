
import { getApiKey } from '../utils/apiKeyUtils';
import { toast } from 'sonner';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

export async function generateSpeech(text: string): Promise<ArrayBuffer | null> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    toast.error('OpenAI API key is required for text-to-speech');
    return null;
  }

  try {
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

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Speech generation error:', error);
    toast.error('Failed to generate AI voice. Using text only.');
    return null;
  }
}

export function playAudioBuffer(audioBuffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    // Define a type for the AudioContext constructor to handle browser prefixes
    const AudioContextConstructor = window.AudioContext || 
      (window as any).webkitAudioContext;
    
    if (!AudioContextConstructor) {
      reject(new Error('Web Audio API is not supported in this browser'));
      return;
    }
    
    const audioContext = new AudioContextConstructor();
    
    audioContext.decodeAudioData(audioBuffer, (buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        resolve();
      };
      
      source.onerror = (err) => {
        reject(err);
      };
      
      source.start(0);
    }, (err) => {
      reject(err);
    });
  });
}
