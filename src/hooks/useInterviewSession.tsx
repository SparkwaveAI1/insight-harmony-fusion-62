
import { useState, useEffect, useCallback } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
// Removed interviewer-specific imports since this functionality is not currently needed
import { 
  saveTranscript, 
  saveAudio, 
  updateParticipantInterview 
} from '../services/supabase/supabaseService';
import { useToast } from './use-toast';

export enum InterviewState {
  IDLE,
  SPEAKING,
  LISTENING,
  PROCESSING,
  COMPLETE
}

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export interface UseInterviewSessionProps {
  participantId?: string;
  initialQuestions: string[];
  onComplete?: (transcript: Message[]) => void;
  useVoice?: boolean;
  silenceDetectionEnabled?: boolean;
  silenceThreshold?: number;
  silenceTimeout?: number;
  recordingDelay?: number;
}

// This hook is currently disabled as the interviewer functionality is not active
export const useInterviewSession = ({
  participantId,
  initialQuestions,
  onComplete,
  useVoice = true,
  silenceDetectionEnabled = true,
  silenceThreshold = 15,
  silenceTimeout = 2500,
  recordingDelay = 800
}: UseInterviewSessionProps) => {
  const [interviewState, setInterviewState] = useState<InterviewState>(InterviewState.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [audioBuffer, setAudioBuffer] = useState<ArrayBuffer | null>(null);
  const { toast } = useToast();

  // Placeholder functions - interviewer functionality is currently disabled
  const skipQuestion = useCallback(() => {
    console.log('Interview functionality is currently disabled');
  }, []);

  const { 
    isRecording, 
    recordingTime, 
    audioBlob, 
    error: recorderError,
    startRecording, 
    stopRecording,
    microphoneAccess 
  } = useAudioRecorder({
    onComplete: () => {
      console.log('Interview functionality is currently disabled');
    },
    debug: true,
    silenceDetectionEnabled,
    silenceThreshold,
    silenceTimeout
  });

  const startInterview = useCallback(async () => {
    console.log('Interview functionality is currently disabled');
  }, []);

  const replayQuestion = useCallback(() => {
    console.log('Interview functionality is currently disabled');
  }, []);

  const completeInterview = async (finalMessages: Message[], finalAudio?: Blob) => {
    console.log('Interview functionality is currently disabled');
  };

  return {
    interviewState,
    messages,
    currentQuestion,
    elapsedTime,
    isRecording,
    canSkip,
    isCompleted,
    startInterview,
    skipQuestion,
    replayQuestion,
    stopInterview: stopRecording
  };
};
