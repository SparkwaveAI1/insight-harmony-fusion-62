
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

let activeAudioElement: HTMLAudioElement | null = null;

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Use the models endpoint to validate the API key
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      console.error('API key validation failed:', response.status, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating OpenAI API key:', error);
    return false;
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    console.log('Generating speech using secured OpenAI TTS proxy:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    
    const payload = {
      model: 'tts-1',
      voice: 'alloy',
      input: text
    };
    
    const { data, error } = await supabase.functions.invoke('openai-proxy', {
      body: { endpoint: 'audio/speech', payload }
    });

    if (error) {
      console.error('Error invoking OpenAI proxy for speech:', error);
      toast.error('Failed to generate speech. Please try again.');
      return null;
    }
    
    if (data.error) {
      console.error('Speech generation failed:', data.error);
      
      if (data.status === 401) {
        toast.error('Authorization error. Please check your account settings.');
      } else if (data.status === 429) {
        toast.error('Rate limit exceeded. Please try again in a moment.');
      } else {
        toast.error('Failed to generate speech. Please try again.');
      }
      
      return null;
    }
    
    // Convert the base64 data to ArrayBuffer
    const binaryString = atob(data.audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  } catch (error) {
    console.error('Error generating speech:', error);
    toast.error('Failed to generate speech. Please try again.');
    return null;
  }
};

export const playAudioBuffer = async (audioBuffer: ArrayBuffer): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Stop any currently playing audio first
      stopAnyPlayingAudio();

      // Create a Blob and URL from the audio buffer
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Create a new audio element and play it
      const audio = new Audio();
      audio.src = audioUrl;

      // Important: Set audio output to speakers only to reduce echo
      if ('setSinkId' in audio && typeof (audio as any).setSinkId === 'function') {
        try {
          // This will ensure audio goes to speakers if the browser supports it
          (audio as any).setSinkId('default');
        } catch (e) {
          console.log('Could not set audio output device', e);
        }
      }

      activeAudioElement = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (activeAudioElement === audio) {
          activeAudioElement = null;
        }
        resolve();
      };
      
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error:', e);
        if (activeAudioElement === audio) {
          activeAudioElement = null;
        }
        reject(new Error('Failed to play audio'));
      };
      
      // Set volume to an appropriate level
      audio.volume = 0.8;
      
      // Play audio
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Audio play error:', error);
          if (activeAudioElement === audio) {
            activeAudioElement = null;
          }
          reject(error);
        });
      }
    } catch (error) {
      console.error('Error playing audio buffer:', error);
      reject(error);
    }
  });
};

// Function to stop any playing audio
export const stopAnyPlayingAudio = (): void => {
  if (activeAudioElement) {
    console.log('Stopping currently playing audio');
    activeAudioElement.pause();
    activeAudioElement.remove();
    activeAudioElement = null;
  }
};
