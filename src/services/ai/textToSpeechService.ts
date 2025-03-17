
import { getApiKey } from '../utils/apiKeyUtils';
import { toast } from 'sonner';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    console.log('Validating API key...');
    const response = await fetch(`${OPENAI_API_ENDPOINT}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`API key validation response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to get response text');
      console.error('API key validation error response:', errorText);
      toast.error('API key validation failed');
    } else {
      console.log('API key validated successfully');
      toast.success('OpenAI API key is valid!');
    }
    
    return response.ok;
  } catch (error) {
    console.error('API key validation error:', error);
    toast.error('API key validation error: Network issue');
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
    console.log('Generating speech for text:', text.substring(0, 30) + '...');
    
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

    console.log(`Speech API response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = 'Failed to generate speech';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        console.error('Speech API error:', errorData);
        toast.error(`TTS error: ${errorMessage}`);
      } catch (parseError) {
        console.error('Error parsing API error response:', parseError);
        console.error('Raw response:', await response.text().catch(() => 'Unable to get response text'));
        toast.error('Failed to parse TTS error response');
      }
      throw new Error(errorMessage);
    }

    // Create a fresh copy of the ArrayBuffer to prevent "detached ArrayBuffer" errors
    const buffer = await response.arrayBuffer();
    const copy = buffer.slice(0);
    console.log(`Received speech audio data: ${copy.byteLength} bytes`);
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
      console.log(`Attempting to play audio buffer: ${audioBuffer.byteLength} bytes`);
      
      // Create a fresh copy of the ArrayBuffer to avoid "detached ArrayBuffer" errors
      const bufferCopy = audioBuffer.slice(0);
      
      // Use a standard AudioContext with proper type handling
      const AudioContextClass = window.AudioContext || 
                               ((window as any).webkitAudioContext as typeof AudioContext);
      
      if (!AudioContextClass) {
        console.error('AudioContext not supported in this browser');
        toast.error('Audio playback not supported in this browser');
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
              audioContext.close().catch(err => console.error('Error closing AudioContext:', err));
              resolve();
            };
            
            console.log('Starting audio playback...');
            source.start(0);
            console.log('Audio playback started');
          } catch (err) {
            console.error('Error playing audio:', err);
            audioContext.close().catch(e => console.error('Error closing AudioContext after error:', e));
            reject(err);
          }
        }, 
        (err) => {
          console.error('Error decoding audio:', err);
          audioContext.close().catch(e => console.error('Error closing AudioContext after decode error:', e));
          toast.error('Failed to decode audio. Please try again.');
          reject(err);
        }
      );
    } catch (err) {
      console.error('Error initializing audio context:', err);
      toast.error('Failed to initialize audio playback. Check your speakers.');
      reject(err);
    }
  });
}
