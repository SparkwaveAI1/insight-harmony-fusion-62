import { useState, useEffect, useCallback } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { transcribeAudio, generateResponse } from '../services/ai/openaiService';
import { 
  generateSpeech, 
  playAudioBuffer, 
  stopAnyPlayingAudio 
} from '../services/ai/textToSpeechService';
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
  recordingDelay?: number; // Added parameter for recording delay
}

export const useInterviewSession = ({
  participantId,
  initialQuestions,
  onComplete,
  useVoice = true,
  silenceDetectionEnabled = true,
  silenceThreshold = 15,
  silenceTimeout = 2500,
  recordingDelay = 800 // Default to 800ms delay
}: UseInterviewSessionProps) => {
  const [interviewState, setInterviewState] = useState<InterviewState>(InterviewState.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [audioBuffer, setAudioBuffer] = useState<ArrayBuffer | null>(null);
  const { toast } = useToast();

  // Initialize audio recorder with silence detection
  const { 
    isRecording, 
    recordingTime, 
    audioBlob, 
    error: recorderError,
    startRecording, 
    stopRecording,
    microphoneAccess 
  } = useAudioRecorder({
    onComplete: handleRecordingComplete,
    debug: true,
    silenceDetectionEnabled,
    silenceThreshold,
    silenceTimeout
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
    
    if (interviewState === InterviewState.LISTENING) {
      // Also enable skip for listening state after 5 seconds
      if (!canSkip) {
        const listeningSkipTimer = setTimeout(() => {
          setCanSkip(true);
        }, 5000);
        
        return () => clearTimeout(listeningSkipTimer);
      }
    }
  }, [interviewState, currentQuestion, canSkip]);

  // Log state changes for debugging
  useEffect(() => {
    console.log(`Interview state changed to: ${InterviewState[interviewState]}`);
    if (interviewState === InterviewState.IDLE) {
      console.log('Interview is idle - waiting to start');
    } else if (interviewState === InterviewState.SPEAKING) {
      console.log(`Speaking question ${currentQuestion + 1} of ${initialQuestions.length}`);
    } else if (interviewState === InterviewState.LISTENING) {
      console.log(`Listening for response to question ${currentQuestion + 1}`);
    } else if (interviewState === InterviewState.PROCESSING) {
      console.log('Processing response...');
    } else if (interviewState === InterviewState.COMPLETE) {
      console.log('Interview completed');
    }
  }, [interviewState, currentQuestion, initialQuestions.length]);

  // Log message changes for debugging
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log(`Message ${messages.length} (${lastMessage.role}): "${lastMessage.content.slice(0, 40)}..."`);
    }
  }, [messages]);

  // Handle recorder errors
  useEffect(() => {
    if (recorderError) {
      console.error('Recorder error:', recorderError);
      toast({
        title: "Recording Error",
        description: recorderError.message,
        variant: "destructive"
      });
      
      // Try to recover by moving to the next question if we're stuck
      if (interviewState === InterviewState.LISTENING) {
        console.log('Attempting to recover from recording error by skipping');
        skipQuestion();
      }
    }
  }, [recorderError, skipQuestion, interviewState, toast]);

  // Monitor silence detection settings
  useEffect(() => {
    console.log(`Silence detection settings: ${silenceDetectionEnabled ? 'enabled' : 'disabled'}, threshold: ${silenceThreshold}%, timeout: ${silenceTimeout}ms`);
  }, [silenceDetectionEnabled, silenceThreshold, silenceTimeout]);

  // Max duration safeguard - automatically stop if recording for too long
  useEffect(() => {
    if (isRecording && recordingTime > 45) {
      console.log('Recording has exceeded maximum allowed time (45s), auto-stopping');
      stopRecording();
    }
  }, [isRecording, recordingTime, stopRecording]);

  // Start the interview
  const startInterview = useCallback(async () => {
    if (interviewState === InterviewState.IDLE) {
      console.log('Starting interview with first question:', initialQuestions[0]);
      
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
          console.log('Generating speech for first question');
          // Stop any existing audio before generating new speech
          stopAnyPlayingAudio();
          
          // Generate and play speech for the first question
          const speechBuffer = await generateSpeech(firstQuestion);
          if (speechBuffer) {
            setAudioBuffer(speechBuffer);
            console.log('Playing first question audio');
            await playAudioBuffer(speechBuffer);
            console.log('Finished playing first question audio');
          }
        } catch (error) {
          console.error('Error playing voice:', error);
          toast({
            title: "Voice Error",
            description: "Could not play audio. Check your speakers.",
            variant: "destructive"
          });
        }
      }
      
      // Add a delay after speech finishes to prevent picking up audio echo
      console.log('Scheduling transition to LISTENING state');
      setTimeout(() => {
        console.log('Transitioning to LISTENING state after first question');
        setInterviewState(InterviewState.LISTENING);
        
        // Add a delay before starting recording to ensure speaker audio has stopped completely
        setTimeout(() => {
          console.log('Starting recording for first response');
          startRecording();
        }, recordingDelay); // Increased delay to further reduce echo chance
      }, useVoice ? 2000 : 2000); // Add more time when using voice
    }
  }, [interviewState, initialQuestions, startRecording, useVoice, toast, recordingDelay]);

  // Handle recording completion
  async function handleRecordingComplete(recording: Blob) {
    console.log(`Recording completed: ${recording.size} bytes`);
    
    if (!recording || recording.size < 100) {
      console.error('No valid recording blob received', recording);
      toast({
        title: "Recording Error",
        description: "No audio was captured. Please check your microphone.",
        variant: "destructive"
      });
      
      // Skip to the next question after a short delay
      setTimeout(() => {
        console.log('Skipping to next question due to recording error');
        skipQuestion();
      }, 1000);
      return;
    }
    
    setInterviewState(InterviewState.PROCESSING);
    
    try {
      console.log('Transcribing audio...');
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
        console.log('Reached the last question, completing interview');
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
            console.log('Generating speech for final message');
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
        console.log(`Moving to question ${currentQuestion + 2} of ${initialQuestions.length}`);
        await processNextQuestion(updatedMessages, recording);
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Error",
        description: "Failed to process your response. Skipping to next question.",
        variant: "destructive"
      });
      
      // Skip to the next question
      setTimeout(() => {
        console.log('Skipping to next question due to transcription error');
        skipQuestion();
      }, 1000);
    }
  }

  // Process the next question
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
        const nextQuestionIndex = currentQuestion + 1;
        nextQuestion = initialQuestions[nextQuestionIndex];
        console.log(`Using predefined question ${nextQuestionIndex + 1}: "${nextQuestion}"`);
        setCurrentQuestion(nextQuestionIndex);
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
          // Stop any existing audio before playing new audio
          stopAnyPlayingAudio();
          
          // Generate and play speech for the next question
          console.log('Generating speech for next question');
          const speechBuffer = await generateSpeech(nextQuestion);
          if (speechBuffer) {
            setAudioBuffer(speechBuffer);
            console.log('Playing speech for next question');
            await playAudioBuffer(speechBuffer);
            console.log('Finished playing speech for question');
          }
          
          // Ensure we wait for the speech to finish before starting to listen
          console.log('Scheduling transition to LISTENING state');
          setTimeout(() => {
            console.log('Transitioning to LISTENING state after playing question');
            setInterviewState(InterviewState.LISTENING);
            setTimeout(() => {
              console.log('Starting recording for user response');
              startRecording();
            }, recordingDelay); // Increased delay to reduce echo
          }, 1500); // Increased delay after speech
        } catch (error) {
          console.error('Error playing voice:', error);
          // In case of speech error, still move to listening state
          console.log('Error in speech playback, moving to LISTENING state anyway');
          setInterviewState(InterviewState.LISTENING);
          setTimeout(() => {
            startRecording();
          }, recordingDelay);
        }
      } else {
        // If no voice, just wait a bit and move to listening state
        setTimeout(() => {
          console.log('Moving to LISTENING state (no voice mode)');
          setInterviewState(InterviewState.LISTENING);
          setTimeout(() => {
            startRecording();
          }, 500);
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
        setTimeout(() => {
          startRecording();
        }, 300);
      }, useVoice ? 1500 : 2000);
    }
  };

  // Skip to the next question
  const skipQuestion = useCallback(() => {
    if (interviewState !== InterviewState.LISTENING && interviewState !== InterviewState.PROCESSING) {
      console.log(`Cannot skip in current state: ${InterviewState[interviewState]}`);
      return;
    }
    
    console.log('Skipping current question');
    
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    
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
        // Stop any existing audio before playing new audio
        stopAnyPlayingAudio();
        
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
            setTimeout(() => {
              setInterviewState(InterviewState.LISTENING);
              startRecording();
            }, 500);
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
        }, 2000);
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
  }, [canSkip, interviewState, currentQuestion, initialQuestions, messages, stopRecording, startRecording, useVoice, isRecording, recordingDelay]);

  // Replay the current question
  const replayQuestion = useCallback(() => {
    if (interviewState === InterviewState.LISTENING) {
      console.log('Replaying current question');
      // Stop current recording
      stopRecording();
      
      // Set state back to speaking
      setInterviewState(InterviewState.SPEAKING);
      
      // Get the current question
      const currentQuestionText = messages[messages.length - 1]?.content || "";
      
      if (useVoice && audioBuffer) {
        // Stop any existing audio before replaying
        stopAnyPlayingAudio();
        
        // Replay the current audio if available
        playAudioBuffer(audioBuffer)
          .then(() => {
            // After speech finishes, move to listening state
            console.log('Audio replay complete, moving to listening state');
            setInterviewState(InterviewState.LISTENING);
            setTimeout(() => {
              startRecording();
            }, recordingDelay); // Increased delay to reduce echo
          })
          .catch(error => {
            console.error('Error replaying voice:', error);
            // In case of error, still continue to listening state
            setInterviewState(InterviewState.LISTENING);
            startRecording();
          });
      } else if (useVoice) {
        // Stop any existing audio before generating new speech
        stopAnyPlayingAudio();
        
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
            setTimeout(() => {
              startRecording();
            }, recordingDelay); // Increased delay to reduce echo
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
        }, 2000);
      }
    }
  }, [interviewState, messages, stopRecording, startRecording, useVoice, audioBuffer, recordingDelay]);

  // Complete the interview
  const completeInterview = async (finalMessages: Message[], finalAudio?: Blob) => {
    // Stop any playing audio 
    stopAnyPlayingAudio();
    
    console.log('Completing interview with', finalMessages.length, 'total messages');
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
