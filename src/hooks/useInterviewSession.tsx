
import { useState, useEffect, useCallback } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { transcribeAudio, generateResponse } from '../services/ai/openaiService';
import { generateSpeech, playAudioBuffer } from '../services/ai/textToSpeechService';
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
  useVoice?: boolean;
}

export const useInterviewSession = ({
  participantId,
  initialQuestions,
  onComplete,
  useVoice = true
}: UseInterviewSessionProps) => {
  const [interviewState, setInterviewState] = useState<InterviewState>(InterviewState.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [audioBuffer, setAudioBuffer] = useState<ArrayBuffer | null>(null);
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
  const startInterview = useCallback(async () => {
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
      
      if (useVoice) {
        try {
          // Generate and play speech for the first question
          const speechBuffer = await generateSpeech(firstQuestion);
          if (speechBuffer) {
            setAudioBuffer(speechBuffer);
            await playAudioBuffer(speechBuffer);
          }
        } catch (error) {
          console.error('Error playing voice:', error);
        }
      }
      
      // After speech finishes or after delay if no voice, move to listening state
      setTimeout(() => {
        setInterviewState(InterviewState.LISTENING);
        startRecording();
      }, useVoice ? 500 : 4000);
    }
  }, [interviewState, initialQuestions, startRecording, useVoice]);

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
        
        // Generate and play the final message if voice is enabled
        if (useVoice) {
          try {
            const speechBuffer = await generateSpeech(finalMessage.content);
            if (speechBuffer) {
              setAudioBuffer(speechBuffer);
              await playAudioBuffer(speechBuffer);
            }
          } catch (error) {
            console.error('Error playing voice:', error);
          }
        }
        
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
      
      if (useVoice) {
        try {
          // Generate and play speech for the next question
          const speechBuffer = await generateSpeech(nextQuestion);
          if (speechBuffer) {
            setAudioBuffer(speechBuffer);
            await playAudioBuffer(speechBuffer);
          }
        } catch (error) {
          console.error('Error playing voice:', error);
        }
      }
      
      // After speech finishes or after delay if no voice, move to listening state
      setTimeout(() => {
        setInterviewState(InterviewState.LISTENING);
        startRecording();
      }, useVoice ? 500 : 4000);
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
      
      if (useVoice) {
        try {
          // Generate and play speech for the fallback question
          const speechBuffer = await generateSpeech(fallbackQuestion);
          if (speechBuffer) {
            setAudioBuffer(speechBuffer);
            await playAudioBuffer(speechBuffer);
          }
        } catch (error) {
          console.error('Error playing voice:', error);
        }
      }
      
      // After speech finishes or after delay if no voice, move to listening state
      setTimeout(() => {
        setInterviewState(InterviewState.LISTENING);
        startRecording();
      }, useVoice ? 500 : 4000);
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
      
      if (useVoice) {
        // Generate and play speech for the next question
        generateSpeech(nextQuestion)
          .then(speechBuffer => {
            if (speechBuffer) {
              setAudioBuffer(speechBuffer);
              return playAudioBuffer(speechBuffer);
            }
            return Promise.resolve();
          })
          .then(() => {
            // After speech finishes, move to listening state
            setInterviewState(InterviewState.LISTENING);
            startRecording();
          })
          .catch(error => {
            console.error('Error playing voice:', error);
            // In case of error, still continue to listening state
            setInterviewState(InterviewState.LISTENING);
            startRecording();
          });
      } else {
        // If no voice, just wait a bit and move to listening state
        setTimeout(() => {
          setInterviewState(InterviewState.LISTENING);
          startRecording();
        }, 4000);
      }
    } else {
      // Complete the interview if no more questions
      const finalMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Thank you for participating in this interview. Your responses have been recorded."
      };
      
      setMessages(prev => [...prev, finalMessage]);
      
      if (useVoice) {
        // Generate and play speech for the final message
        generateSpeech(finalMessage.content)
          .then(speechBuffer => {
            if (speechBuffer) {
              setAudioBuffer(speechBuffer);
              return playAudioBuffer(speechBuffer);
            }
            return Promise.resolve();
          })
          .then(() => {
            // After speech finishes, complete the interview
            completeInterview([...messages, skippedMessage, finalMessage]);
          })
          .catch(error => {
            console.error('Error playing voice:', error);
            // In case of error, still complete the interview
            completeInterview([...messages, skippedMessage, finalMessage]);
          });
      } else {
        // If no voice, just complete the interview
        completeInterview([...messages, skippedMessage, finalMessage]);
      }
    }
  }, [canSkip, interviewState, currentQuestion, initialQuestions, messages, stopRecording, startRecording, useVoice]);

  // Replay the current question
  const replayQuestion = useCallback(() => {
    if (interviewState === InterviewState.LISTENING) {
      // Stop current recording
      stopRecording();
      
      // Set state back to speaking
      setInterviewState(InterviewState.SPEAKING);
      
      // Get the current question
      const currentQuestionText = messages[messages.length - 1]?.content || "";
      
      if (useVoice && audioBuffer) {
        // Replay the current audio if available
        playAudioBuffer(audioBuffer)
          .then(() => {
            // After speech finishes, move to listening state
            setInterviewState(InterviewState.LISTENING);
            startRecording();
          })
          .catch(error => {
            console.error('Error replaying voice:', error);
            // In case of error, still continue to listening state
            setInterviewState(InterviewState.LISTENING);
            startRecording();
          });
      } else if (useVoice) {
        // Generate speech if no audio buffer is available
        generateSpeech(currentQuestionText)
          .then(speechBuffer => {
            if (speechBuffer) {
              setAudioBuffer(speechBuffer);
              return playAudioBuffer(speechBuffer);
            }
            return Promise.resolve();
          })
          .then(() => {
            // After speech finishes, move to listening state
            setInterviewState(InterviewState.LISTENING);
            startRecording();
          })
          .catch(error => {
            console.error('Error playing voice:', error);
            // In case of error, still continue to listening state
            setInterviewState(InterviewState.LISTENING);
            startRecording();
          });
      } else {
        // If no voice, just wait a bit and move to listening state
        setTimeout(() => {
          setInterviewState(InterviewState.LISTENING);
          startRecording();
        }, 4000);
      }
    }
  }, [interviewState, messages, stopRecording, startRecording, useVoice, audioBuffer]);

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
    isRecording, // Explicitly return isRecording from the hook
    canSkip,
    isCompleted,
    startInterview,
    skipQuestion,
    replayQuestion,
    stopInterview: stopRecording
  };
};
