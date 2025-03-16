
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Mic, MicOff, Pause, Play, 
  SkipForward, Volume2, VolumeX,
  ArrowLeft, ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Sample interview questions
const INTERVIEW_QUESTIONS = [
  "Tell me about yourself and what interests you most about participating in this research?",
  "What topics or issues are you most passionate about in today's world?",
  "How do you typically form opinions on complex social or political issues?",
  "Describe a time when you changed your mind about an important topic. What influenced your perspective?",
  "What sources of information do you trust the most and why?",
  "How do you feel technology has impacted how people communicate and share ideas?",
  "What do you think are the biggest challenges facing society today?",
  "How would you describe your decision-making process when faced with difficult choices?",
  "What experiences have shaped your worldview the most?",
  "Is there anything else you'd like to share about your perspectives or experiences?"
];

interface InterviewState {
  currentQuestionIndex: number;
  responses: Record<number, string>;
  completedQuestions: number[];
  isPaused: boolean;
}

const VoiceInterviewSession = () => {
  const navigate = useNavigate();
  
  // Session state management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // UI state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Refs
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const progressPercentage = Math.round(((completedQuestions.length) / INTERVIEW_QUESTIONS.length) * 100);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    
    // Check for browser support of SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };
    } else {
      console.error('Speech recognition not supported in this browser');
    }
    
    // Load interview state from local storage
    loadInterviewState();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);
  
  // Save state when interview is paused or when moving between questions
  useEffect(() => {
    if (isPaused || completedQuestions.length > 0) {
      saveInterviewState();
    }
  }, [isPaused, responses, currentQuestionIndex, completedQuestions]);
  
  // Speak the current question when it changes
  useEffect(() => {
    if (!isPaused && currentQuestionIndex < INTERVIEW_QUESTIONS.length) {
      speakQuestion(INTERVIEW_QUESTIONS[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, isPaused]);
  
  const loadInterviewState = () => {
    const savedState = localStorage.getItem('voiceInterviewState');
    if (savedState) {
      try {
        const parsedState: InterviewState = JSON.parse(savedState);
        setCurrentQuestionIndex(parsedState.currentQuestionIndex);
        setResponses(parsedState.responses);
        setCompletedQuestions(parsedState.completedQuestions);
        setIsPaused(false); // Always start unpaused when loading
      } catch (error) {
        console.error('Failed to parse saved interview state', error);
      }
    }
  };
  
  const saveInterviewState = () => {
    const stateToSave: InterviewState = {
      currentQuestionIndex,
      responses,
      completedQuestions,
      isPaused
    };
    localStorage.setItem('voiceInterviewState', JSON.stringify(stateToSave));
  };
  
  const speakQuestion = (text: string) => {
    if (isMuted || !speechSynthesisRef.current) return;
    
    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower rate for clarity
    utterance.pitch = 1.0;
    
    // Start recording after the AI finishes speaking
    utterance.onend = () => {
      // Small delay before starting recording
      setTimeout(() => {
        startRecording();
      }, 500);
    };
    
    speechSynthesisRef.current.speak(utterance);
  };
  
  const startRecording = () => {
    if (!recognitionRef.current) return;
    
    setIsRecording(true);
    setTranscript("");
    recognitionRef.current.start();
    
    // Auto-stop recording after 45 seconds if the user doesn't stop manually
    setTimeout(() => {
      if (isRecording) {
        stopRecording();
      }
    }, 45000);
  };
  
  const stopRecording = () => {
    if (!recognitionRef.current || !isRecording) return;
    
    recognitionRef.current.stop();
    setIsRecording(false);
    
    // Save response
    if (transcript.trim()) {
      setResponses(prev => ({
        ...prev,
        [currentQuestionIndex]: transcript
      }));
      
      if (!completedQuestions.includes(currentQuestionIndex)) {
        setCompletedQuestions(prev => [...prev, currentQuestionIndex]);
      }
    }
  };
  
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (speechSynthesisRef.current) {
      if (!isMuted) {
        speechSynthesisRef.current.cancel();
      } else {
        // If unmuting, repeat the current question
        speakQuestion(INTERVIEW_QUESTIONS[currentQuestionIndex]);
      }
    }
  };
  
  const handlePauseResume = () => {
    if (isPaused) {
      // Resuming
      setIsPaused(false);
      speakQuestion(INTERVIEW_QUESTIONS[currentQuestionIndex]);
    } else {
      // Pausing
      setIsPauseDialogOpen(true);
      if (isRecording) {
        stopRecording();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    }
  };
  
  const confirmPause = () => {
    setIsPaused(true);
    setIsPauseDialogOpen(false);
    saveInterviewState();
  };
  
  const handleSkipQuestion = () => {
    if (isRecording) {
      stopRecording();
    }
    goToNextQuestion();
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      if (isRecording) {
        stopRecording();
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1) {
      if (isRecording) {
        stopRecording();
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Handle interview completion
      handleInterviewComplete();
    }
  };
  
  const handleInterviewComplete = () => {
    localStorage.removeItem('voiceInterviewState'); // Clear saved state
    setIsLoading(true);
    
    // Simulate sending data to server
    setTimeout(() => {
      setIsLoading(false);
      navigate('/interview-complete', { state: { responses } });
    }, 2000);
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-8">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }} 
        />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {INTERVIEW_QUESTIONS.length}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToggleMute}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePauseResume}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
      </div>
      
      {/* Question card */}
      <div className="bg-card rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-6">
          {INTERVIEW_QUESTIONS[currentQuestionIndex]}
        </h2>
        
        <div className={`border rounded-md p-4 min-h-28 mb-6 ${isRecording ? 'border-primary' : 'border-muted'}`}>
          {isRecording ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  Recording your answer...
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={stopRecording}
                >
                  <MicOff className="h-4 w-4 mr-1" /> Stop
                </Button>
              </div>
              <p className="text-muted-foreground italic">{transcript || "Speak your answer..."}</p>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Your answer</span>
                {!isPaused && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={startRecording}
                  >
                    <Mic className="h-4 w-4 mr-1" /> Record
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground">
                {responses[currentQuestionIndex] || "You haven't recorded an answer yet."}
              </p>
            </>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0 || isRecording || isPaused}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleSkipQuestion}
            disabled={isRecording || isPaused}
          >
            <SkipForward className="h-4 w-4 mr-1" /> Skip
          </Button>
          
          <Button
            variant="default"
            onClick={goToNextQuestion}
            disabled={isRecording || isPaused}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Pause dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Interview?</DialogTitle>
            <DialogDescription>
              Your progress will be saved and you can continue later from this question.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="ghost" onClick={() => setIsPauseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPause}>
              Pause Interview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="relative inline-block h-12 w-12 mb-4">
              <div className="absolute h-12 w-12 rounded-full border-4 border-primary border-opacity-25"></div>
              <div className="absolute h-12 w-12 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
            </div>
            <p className="font-medium">Submitting your interview responses...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInterviewSession;
