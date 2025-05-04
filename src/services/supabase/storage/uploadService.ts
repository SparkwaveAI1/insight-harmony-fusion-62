
import { supabase } from '@/integrations/supabase/client';
import { updateParticipantInterview } from '../participants/interviewService';

// Save interview transcript
export async function saveTranscript(participantId: string, transcript: string): Promise<string | null> {
  try {
    const fileName = `transcript_${participantId}_${Date.now()}.json`;
    
    // Upload transcript to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('transcripts')
      .upload(fileName, JSON.stringify({ transcript }), {
        contentType: 'application/json',
      });

    if (error) throw error;
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase
      .storage
      .from('transcripts')
      .getPublicUrl(fileName);
      
    // Update the participant record with the transcript URL
    await updateParticipantInterview(participantId, {
      transcript_url: urlData.publicUrl
    });
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error saving transcript:', error);
    return null;
  }
}

// Save interview audio
export async function saveAudio(participantId: string, audioBlob: Blob): Promise<string | null> {
  try {
    const fileName = `audio_${participantId}_${Date.now()}.mp3`;
    
    // Upload audio to Supabase storage - updated to use 'interview-audio' bucket
    const { data, error } = await supabase
      .storage
      .from('interview-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
      });

    if (error) throw error;
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase
      .storage
      .from('interview-audio')
      .getPublicUrl(fileName);
      
    // Update the participant record with the audio URL
    await updateParticipantInterview(participantId, {
      audio_url: urlData.publicUrl
    });
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error saving audio:', error);
    return null;
  }
}
