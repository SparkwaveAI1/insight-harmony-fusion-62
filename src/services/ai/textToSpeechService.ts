
import { getApiKey } from '../utils/apiKeyUtils';
import { toast } from 'sonner';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    console.log('VALIDATING API KEY: Starting validation...');
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
      console.error('API KEY VALIDATION ERROR: Response:', errorText);
      
      if (response.status === 401) {
        toast.error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error(`API key validation failed: ${response.status}`);
      }
      return false;
    } else {
      console.log('API KEY VALIDATION SUCCESS: Key is valid');
      toast.success('OpenAI API key is valid!');
      
      // Check if the response includes models list
      try {
        const models = await response.json();
        console.log('AVAILABLE MODELS:', models.data.map((m: any) => m.id).join(', '));
        
        const hasAudioModels = models.data.some((model: any) => 
          model.id === 'tts-1' || model.id === 'whisper-1'
        );
        
        if (!hasAudioModels) {
          console.warn('API KEY ISSUE: Key does not have access to required audio models');
          toast.warning('Your API key may not have access to required audio models (tts-1, whisper-1)');
        } else {
          console.log('API KEY HAS AUDIO MODELS: tts-1 and whisper-1 available');
        }
      } catch (err) {
        console.error('Error checking models access:', err);
      }
      
      return true;
    }
  } catch (error) {
    console.error('API KEY VALIDATION ERROR:', error);
    toast.error('API key validation error: Network issue');
    return false;
  }
}

export async function generateSpeech(text: string): Promise<ArrayBuffer | null> {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    console.error('OpenAI API key is missing');
    toast.error('OpenAI API key is required for text-to-speech');
    return null;
  }

  try {
    console.log('SPEECH GENERATION: Starting...');
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

    console.log(`SPEECH GENERATION RESPONSE: Status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = 'Failed to generate speech';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        console.error('SPEECH GENERATION ERROR:', errorData);
        
        if (response.status === 401) {
          toast.error('Invalid API key. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else {
          toast.error(`TTS error: ${errorMessage}`);
        }
      } catch (parseError) {
        console.error('Error parsing API error response:', parseError);
        console.error('Raw response:', await response.text().catch(() => 'Unable to get response text'));
        toast.error('Failed to parse TTS error response');
      }
      throw new Error(errorMessage);
    }

    // Create a fresh copy of the ArrayBuffer to prevent "detached ArrayBuffer" errors
    const buffer = await response.arrayBuffer();
    
    if (buffer.byteLength === 0) {
      console.error('SPEECH GENERATION ERROR: Received empty audio buffer from OpenAI');
      toast.error('Received empty audio from TTS service');
      return null;
    }
    
    const copy = buffer.slice(0);
    console.log(`SPEECH GENERATION SUCCESS: Received audio data: ${copy.byteLength} bytes`);
    return copy;
  } catch (error) {
    console.error('SPEECH GENERATION ERROR:', error);
    toast.error('Failed to generate AI voice. Using text only.');
    return null;
  }
}

export function playAudioBuffer(audioBuffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log(`AUDIO PLAYBACK: Attempting to play audio buffer: ${audioBuffer.byteLength} bytes`);
      
      if (audioBuffer.byteLength === 0) {
        console.error('AUDIO PLAYBACK ERROR: Cannot play empty audio buffer');
        toast.error('Audio data is empty, cannot play');
        reject(new Error('Empty audio buffer'));
        return;
      }
      
      // Create a fresh copy of the ArrayBuffer to avoid "detached ArrayBuffer" errors
      const bufferCopy = audioBuffer.slice(0);
      
      // Use a standard AudioContext with proper type handling
      const AudioContextClass = window.AudioContext || 
                               ((window as any).webkitAudioContext as typeof AudioContext);
      
      if (!AudioContextClass) {
        console.error('AUDIO PLAYBACK ERROR: AudioContext not supported in this browser');
        toast.error('Audio playback not supported in this browser');
        throw new Error('AudioContext not supported in this browser');
      }
      
      // Using standard AudioContext
      const audioContext = new AudioContextClass();
      
      console.log('AUDIO PLAYBACK: AudioContext created, decoding audio data...');
      
      audioContext.decodeAudioData(
        bufferCopy, 
        (buffer) => {
          try {
            console.log('AUDIO PLAYBACK: Audio data decoded successfully, creating source node...');
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            
            source.onended = () => {
              console.log('AUDIO PLAYBACK: Completed');
              audioContext.close().catch(err => console.error('Error closing AudioContext:', err));
              resolve();
            };
            
            // Fix: Using addEventListener instead of the non-standard onerror property
            // This is the TypeScript-compliant way to handle errors
            source.addEventListener('error', (err) => {
              console.error('AUDIO PLAYBACK ERROR:', err);
              audioContext.close().catch(e => console.error('Error closing AudioContext after playback error:', e));
              reject(err);
            });
            
            console.log('AUDIO PLAYBACK: Starting...');
            source.start(0);
            console.log('AUDIO PLAYBACK: Started');
            
            // Add a safety timeout in case onended doesn't fire
            setTimeout(() => {
              if (audioContext.state !== 'closed') {
                console.log('AUDIO PLAYBACK: Timeout reached, closing context');
                audioContext.close().catch(err => console.error('Error closing AudioContext on timeout:', err));
                resolve();
              }
            }, buffer.duration * 1000 + 2000); // Add 2 seconds buffer
          } catch (err) {
            console.error('AUDIO PLAYBACK ERROR:', err);
            audioContext.close().catch(e => console.error('Error closing AudioContext after error:', e));
            reject(err);
          }
        }, 
        (err) => {
          console.error('AUDIO PLAYBACK ERROR: Decoding failed:', err);
          audioContext.close().catch(e => console.error('Error closing AudioContext after decode error:', e));
          toast.error('Failed to decode audio. Please try again.');
          reject(err);
        }
      );
    } catch (err) {
      console.error('AUDIO PLAYBACK ERROR: Initialization failed:', err);
      toast.error('Failed to initialize audio playback. Check your speakers.');
      reject(err);
    }
  });
}
