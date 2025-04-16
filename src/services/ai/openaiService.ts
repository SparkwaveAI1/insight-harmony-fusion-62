
import { getApiKey } from '../utils/apiKeyUtils';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export interface TranscriptionResponse {
  text: string;
}

// Helper function to make authenticated OpenAI API calls via the Supabase Edge Function
async function callOpenAIViaProxy(endpoint: string, payload: any) {
  try {
    const { data, error } = await supabase.functions.invoke('openai-proxy', {
      body: { endpoint, payload }
    });

    if (error) {
      console.error('OpenAI proxy error:', error);
      toast.error('Error connecting to AI service');
      throw new Error(error.message || 'Error connecting to AI service');
    }

    if (data.error) {
      console.error('OpenAI API error:', data.error);
      
      // Handle different error types
      if (data.status === 429) {
        toast.error('Rate limit exceeded. Please try again in a moment.');
      } else {
        toast.error('AI service error: ' + (data.error.message || 'Unknown error'));
      }
      
      throw new Error(data.error.message || 'AI service error');
    }

    return data;
  } catch (error) {
    console.error('Error calling OpenAI via proxy:', error);
    throw error;
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
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

  // Determine the correct file extension based on the MIME type
  let filename = 'audio.webm';
  const blobType = audioBlob.type.toLowerCase();
  
  if (blobType.includes('webm')) {
    filename = 'audio.webm';
  } else if (blobType.includes('wav') || blobType.includes('wave')) {
    filename = 'audio.wav';
  } else if (blobType.includes('mp3') || blobType.includes('mpeg')) {
    filename = 'audio.mp3';
  } else {
    console.warn(`Unknown audio type: ${blobType}, defaulting to webm`);
  }
  
  console.log(`Using filename: ${filename} for blob type: ${blobType}`);
  
  try {
    console.log(`START TRANSCRIPTION: Sending audio for transcription, size: ${audioBlob.size} bytes`);
    
    // Convert the Blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    // Prepare the payload for the OpenAI API
    const payload = {
      file: base64Audio,
      model: 'whisper-1',
      response_format: 'json',
      language: 'en'
    };
    
    // Call OpenAI via our secure proxy
    const result = await callOpenAIViaProxy('audio/transcriptions', payload);
    console.log('TRANSCRIPTION SUCCESS: Result:', result);
    
    if (!result.text || result.text.trim() === '') {
      console.warn('Empty transcription received from API');
      toast.warning('No speech detected. Please speak more clearly or check your microphone.');
      return { text: '[No speech detected. Please speak more clearly.]' };
    }
    
    return result;
  } catch (error) {
    console.error('TRANSCRIPTION ERROR:', error);
    toast.error('Failed to transcribe speech. Please try again.');
    return { text: '[Had trouble hearing you. Please check your microphone and try again.]' };
  }
}

export async function generateResponse(messages: { role: string, content: string }[]): Promise<string> {
  console.log('START GENERATING RESPONSE');
  console.log('Sending messages to OpenAI:', JSON.stringify(messages, null, 2));

  try {
    console.log('Sending chat request via secured proxy');
    
    const payload = {
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
    };
    
    // Call OpenAI via our secure proxy
    const data = await callOpenAIViaProxy('chat/completions', payload);
    console.log('CHAT SUCCESS: OpenAI response:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('CHAT ERROR: Response generation error:', error);
    toast.error('Failed to generate AI response. Please try again.');
    return "I'm sorry, I couldn't process your response right now. Let's try again.";
  }
}
