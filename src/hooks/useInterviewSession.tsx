
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
        console.log('Moving to LISTENING state after first question');
        setInterviewState(InterviewState.LISTENING);
        startRecording();
      }, useVoice ? 1000 : 4000);
    }
  }, [interviewState, initialQuestions, startRecording, useVoice]);

  // Handle recording completion - Fixed to ensure proper state transitions
  async function handleRecordingComplete(recording: Blob) {
    if (!recording) {
      console.error('No recording blob received');
      setInterviewState(InterviewState.LISTENING);
      startRecording();
      return;
    }
    
    console.log(`Recording completed, size: ${recording.size} bytes`);
    setInterviewState(InterviewState.PROCESSING);
    
    try {
      // Transcribe the audio
      const transcription = await transcribeAudio(recording);
      console.log(`Transcription result: "${transcription.text}"`);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcription.text
      };
      
      // Update messages state with the new user message
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Check if this was the last predefined question
      if (currentQuestion >= initialQuestions.length - 1) {
        // Add final AI message
        const finalMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "Thank you for participating in this interview. Your responses have been recorded."
        };
        
        const finalMessages = [...updatedMessages, finalMessage];
        setMessages(finalMessages);
        
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
        
        completeInterview(finalMessages, recording);
      } else {
        // Move to next question
        console.log(`Moving to next question (${currentQuestion + 1})`);
        await processNextQuestion(updatedMessages, recording);
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

  // Process the next question - Fixed timings and added better error handling
  const processNextQuestion = async (currentMessages: Message[], audioRecording: Blob) => {
    try {
      console.log('Processing next question');
      
      // Save the audio chunk
      if (participantId) {
        await saveAudio(participantId, audioRecording);
      }
      
      let nextQuestion: string;
      
      // Check if we should use a predefined question or generate one
      if (currentQuestion < initialQuestions.length - 1) {
        // Use next predefined question
        nextQuestion = initialQuestions[currentQuestion + 1];
        console.log(`Using predefined question: "${nextQuestion}"`);
        setCurrentQuestion(prevQuestion => prevQuestion + 1);
      } else {
        // Generate a follow-up question based on conversation
        const messageHistory = currentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        console.log('Generating follow-up question based on conversation');
        nextQuestion = await generateResponse(messageHistory);
      }
      
      // Add AI question
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: nextQuestion
      };
      
      // Update messages with the new AI question
      setMessages(prev => [...prev, aiMessage]);
      setInterviewState(InterviewState.SPEAKING);
      
      console.log('Starting speech for next question:', nextQuestion);
      
      if (useVoice) {
        try {
          // Generate and play speech for the next question
          const speechBuffer = await generateSpeech(nextQuestion);
          if (speechBuffer) {
            setAudioBuffer(speechBuffer);
            await playAudioBuffer(speechBuffer);
            console.log('Finished playing speech for question');
          }
          
          // Ensure we wait for the speech to finish before starting to listen
          setTimeout(() => {
            console.log('Moving to LISTENING state after playing question');
            setInterviewState(InterviewState.LISTENING);
            setTimeout(() => {
              console.log('Starting recording for user response');
              startRecording();
            }, 300); // Small delay to ensure state has updated
          }, 500);
        } catch (error) {
          console.error('Error playing voice:', error);
          // In case of speech error, still move to listening state
          console.log('Error in speech playback, moving to LISTENING state anyway');
          setInterviewState(InterviewState.LISTENING);
          startRecording();
        }
      } else {
        // If no voice, just wait a bit and move to listening state
        setTimeout(() => {
          console.log('Moving to LISTENING state (no voice mode)');
          setInterviewState(InterviewState.LISTENING);
          startRecording();
        }, 2000);
      }
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
      }, useVoice ? 1000 : 2000);
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
    isRecording,
    canSkip,
    isCompleted,
    startInterview,
    skipQuestion,
    replayQuestion,
    stopInterview: stopRecording
  };
};
