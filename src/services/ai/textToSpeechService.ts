import { getApiKey } from '../utils/apiKeyUtils';
import { toast } from 'sonner';

const AZURE_SPEECH_ENDPOINT = 'https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken';
const AZURE_SPEECH_REGION = 'eastus';

let activeAudioElement: HTMLAudioElement | null = null;

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  const apiKey = getApiKey('azure');

  if (!apiKey) {
    console.error('Azure API key is missing');
    toast.error('Azure API key is required for AI responses');
    return null;
  }

  try {
    const tokenResponse = await fetch(AZURE_SPEECH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get Azure token', tokenResponse.status, tokenResponse.statusText);
      toast.error('Failed to authenticate with Azure Speech Services.');
      return null;
    }

    const accessToken = await tokenResponse.text();

    const ssml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='en-US-JennyNeural'>${text}</voice></speak>`;

    const response = await fetch(`https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'X-Search-AppId': '07D3234E49CE426DAA29772419F43675',
        'X-Search-ClientId': '1ECFAE91408841A480F00935DC390960',
        'User-Agent': 'Lovable'
      },
      body: ssml
    });

    if (!response.ok) {
      console.error('Speech generation failed', response.status, response.statusText);
      toast.error('Failed to generate speech. Please check your API key and settings.');
      return null;
    }

    const audioArrayBuffer = await response.arrayBuffer();
    return audioArrayBuffer;
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
      if (activeAudioElement) {
        activeAudioElement.pause();
        activeAudioElement.remove();
        activeAudioElement = null;
      }

      // Create a Blob and URL from the audio buffer
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Create a new audio element and play it
      const audio = new HTMLAudioElement();
      audio.src = audioUrl;

      // Important: Set audio output to speakers only to reduce echo
      if (audio.setSinkId && typeof audio.setSinkId === 'function') {
        try {
          // This will ensure audio goes to speakers if the browser supports it
          audio.setSinkId('default');
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
        reject(new Error('Failed to play audio'));
      };
      
      // Play audio
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Audio play error:', error);
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
    activeAudioElement.pause();
    activeAudioElement.remove();
    activeAudioElement = null;
  }
};
