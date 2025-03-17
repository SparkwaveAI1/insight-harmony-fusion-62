
import { useState, useEffect, useCallback } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { transcribeAudio, generateResponse } from '../services/ai/openaiService';
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

interface UseInterviewSessionProps {
  participantId?: string;
  initialQuestions: string[];
  onComplete?: (transcript: Message[]) => void;
}

export const useInterviewSession = ({
  participantId,
  initialQuestions,
  onComplete
}: UseInterviewSessionProps) => {
  const [interviewState, setInterviewState] = useState<InterviewState>(InterviewState.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize audio recorder
  const { 
    isRecording, 
    recordingTime, 
    audioBlob, 
    startRecording, 
    stopRecording 
  } = useAudioRecorder({
    onComplete: handleRecordingComplete
  });

  // Timer for the interview
  useEffect(() => {
    const timer = setInterval(() => {
      if (interviewState !== InterviewState.IDLE && interviewState !== InterviewState.COMPLETE) {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewState]);

  // Handle skip timer
  useEffect(() => {
    if (interviewState === InterviewState.SPEAKING) {
      // Reset skip ability with each new question
      setCanSkip(false);
      
      // Enable skip after 10 seconds
      const skipTimer = setTimeout(() => {
        setCanSkip(true);
      }, 10000);
      
      return () => clearTimeout(skipTimer);
    }
  }, [interviewState, currentQuestion]);

  // Start the interview
  const startInterview = useCallback(() => {
    if (interviewState === InterviewState.IDLE) {
      // Add first question
      const firstQuestion = initialQuestions[0];
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "ai",
        content: firstQuestion
      };
      
      setMessages([newMessage]);
      setInterviewState(InterviewState.SPEAKING);
      setElapsedTime(0);
      
      // Simulate AI speaking for 4 seconds
      setTimeout(() => {
        setInterviewState(InterviewState.LISTENING);
        startRecording();
      }, 4000);
    }
  }, [interviewState, initialQuestions, startRecording]);

  // Handle recording completion
  async function handleRecordingComplete(recording: Blob) {
    if (!recording) return;
    
    setInterviewState(InterviewState.PROCESSING);
    
    try {
      // Transcribe the audio
      const transcription = await transcribeAudio(recording);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcription.text
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Check if this was the last predefined question
      if (currentQuestion >= initialQuestions.length - 1) {
        // Add final AI message
        const finalMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "Thank you for participating in this interview. Your responses have been recorded."
        };
        
        setMessages(prev => [...prev, finalMessage]);
        completeInterview([...messages, userMessage, finalMessage], recording);
      } else {
        // Move to next question
        await processNextQuestion([...messages, userMessage], recording);
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive"
      });
      
      setInterviewState(InterviewState.LISTENING);
      startRecording();
    }
  }

  // Process the next question
  const processNextQuestion = async (currentMessages: Message[], audioRecording: Blob) => {
    try {
      // Save the audio chunk
      if (participantId) {
        await saveAudio(participantId, audioRecording);
      }
      
      let nextQuestion: string;
      
      // Check if we should use a predefined question or generate one
      if (currentQuestion < initialQuestions.length - 1) {
        // Use next predefined question
        nextQuestion = initialQuestions[currentQuestion + 1];
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Generate a follow-up question based on conversation
        const messageHistory = currentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        nextQuestion = await generateResponse(messageHistory);
      }
      
      // Add AI question
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: nextQuestion
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setInterviewState(InterviewState.SPEAKING);
      
      // Simulate AI speaking for 4 seconds
      setTimeout(() => {
        setInterviewState(InterviewState.LISTENING);
        startRecording();
      }, 4000);
    } catch (error) {
      console.error('Error processing next question:', error);
      toast({
        title: "Error",
        description: "Failed to generate the next question. Using a fallback question.",
        variant: "destructive"
      });
      
      // Fallback to a generic question
      const fallbackQuestion = "Could you tell me more about that?";
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: fallbackQuestion
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setInterviewState(InterviewState.SPEAKING);
      
      // Simulate AI speaking for 4 seconds
      setTimeout(() => {
        setInterviewState(InterviewState.LISTENING);
        startRecording();
      }, 4000);
    }
  };

  // Skip to the next question
  const skipQuestion = useCallback(() => {
    if (!canSkip || interviewState !== InterviewState.LISTENING) return;
    
    stopRecording();
    
    // Add a placeholder user response
    const skippedMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: "[Question skipped]"
    };
    
    setMessages(prev => [...prev, skippedMessage]);
    
    // Move to next question if available
    if (currentQuestion < initialQuestions.length - 1) {
      const nextQuestion = initialQuestions[currentQuestion + 1];
      setCurrentQuestion(currentQuestion + 1);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: nextQuestion
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setInterviewState(InterviewState.SPEAKING);
      
      // Simulate AI speaking for 4 seconds
      setTimeout(() => {
        setInterviewState(InterviewState.LISTENING);
        startRecording();
      }, 4000);
    } else {
      // Complete the interview if no more questions
      const finalMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Thank you for participating in this interview. Your responses have been recorded."
      };
      
      setMessages(prev => [...prev, finalMessage]);
      completeInterview([...messages, skippedMessage, finalMessage]);
    }
  }, [canSkip, interviewState, currentQuestion, initialQuestions, messages, stopRecording, startRecording]);

  // Replay the current question
  const replayQuestion = useCallback(() => {
    if (interviewState === InterviewState.LISTENING) {
      // Stop current recording
      stopRecording();
      
      // Set state back to speaking
      setInterviewState(InterviewState.SPEAKING);
      
      // Simulate AI speaking for 4 seconds
      setTimeout(() => {
        setInterviewState(InterviewState.LISTENING);
        startRecording();
      }, 4000);
    }
  }, [interviewState, stopRecording, startRecording]);

  // Complete the interview
  const completeInterview = async (finalMessages: Message[], finalAudio?: Blob) => {
    setInterviewState(InterviewState.COMPLETE);
    setIsCompleted(true);
    
    if (participantId) {
      try {
        // Save final audio if available
        if (finalAudio) {
          await saveAudio(participantId, finalAudio);
        }
        
        // Save complete transcript
        const transcriptUrl = await saveTranscript(participantId, JSON.stringify(finalMessages));
        
        // Update participant record
        await updateParticipantInterview(participantId, {
          interview_completed: true,
          transcript_url: transcriptUrl || undefined
        });
      } catch (error) {
        console.error('Error saving interview data:', error);
        toast({
          title: "Warning",
          description: "Interview completed, but there was an issue saving all data.",
          variant: "destructive"
        });
      }
    }
    
    // Call the onComplete callback with the final transcript
    onComplete?.(finalMessages);
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
