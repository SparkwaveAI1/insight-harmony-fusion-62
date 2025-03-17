
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Pause, Play, 
  Volume2, VolumeX, 
  ArrowLeft, SkipForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { ConversationDisplay, Message } from "@/components/interview/ConversationDisplay";
import { useToast } from "@/hooks/use-toast";

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
  messages: Message[];
  responses: Record<number, string>;
  completedQuestions: number[];
  isPaused: boolean;
  sessionId: string;
}

const VoiceInterviewSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Session state management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `session_${Date.now()}`);
  
  // UI state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [interviewComplete, setInterviewComplete] = useState<boolean>(false);

  // Refs
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // Speech recognition hook
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening 
  } = useSpeechRecognition({
    onResult: (text) => {
      // Update the current user message with the transcript
      if (messages.length && messages[messages.length - 1].role === 'user') {
        setMessages(prev => 
          prev.map((msg, i) => 
            i === prev.length - 1 ? { ...msg, content: text } : msg
          )
        );
      }
    },
    onEnd: () => {
      if (messages.length && messages[messages.length - 1].role === 'user') {
        // Mark the message as complete
        setMessages(prev => 
          prev.map((msg, i) => 
            i === prev.length - 1 ? { ...msg, isComplete: true } : msg
          )
        );
        
        // Save the response
        if (transcript.trim()) {
          setResponses(prev => ({
            ...prev,
            [currentQuestionIndex]: transcript
          }));
          
          if (!completedQuestions.includes(currentQuestionIndex)) {
            setCompletedQuestions(prev => [...prev, currentQuestionIndex]);
          }
          
          // Move to next question after a brief pause
          setTimeout(() => {
            if (currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1) {
              goToNextQuestion();
            } else {
              handleInterviewComplete();
            }
          }, 1000);
        }
      }
    }
  });
  
  // Computed state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const progressPercentage = Math.round(((completedQuestions.length) / INTERVIEW_QUESTIONS.length) * 100);

  // Initialize speech synthesis
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    
    // Load interview state from local storage
    loadInterviewState();
    
    return () => {
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
  }, [isPaused, responses, currentQuestionIndex, completedQuestions, messages]);
  
  // Speak the current question when it changes
  useEffect(() => {
    if (!isPaused && !showWelcome && currentQuestionIndex < INTERVIEW_QUESTIONS.length && !isListening) {
      const currentQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex];
      
      // Add AI message if it doesn't exist
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'ai' || lastMessage.content !== currentQuestion) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            role: 'ai',
            content: currentQuestion,
            isComplete: true
          }
        ]);
        
        speakText(currentQuestion);
      }
    }
  }, [currentQuestionIndex, isPaused, showWelcome, isListening]);
  
  const loadInterviewState = () => {
    const savedState = localStorage.getItem('voiceInterviewState');
    if (savedState) {
      try {
        const parsedState: InterviewState = JSON.parse(savedState);
        setCurrentQuestionIndex(parsedState.currentQuestionIndex);
        setMessages(parsedState.messages);
        setResponses(parsedState.responses);
        setCompletedQuestions(parsedState.completedQuestions);
        setIsPaused(false); // Always start unpaused when loading
        setShowWelcome(false); // Skip welcome screen if we're loading a saved session
      } catch (error) {
        console.error('Failed to parse saved interview state', error);
      }
    }
  };
  
  const saveInterviewState = () => {
    const stateToSave: InterviewState = {
      currentQuestionIndex,
      messages,
      responses,
      completedQuestions,
      isPaused,
      sessionId
    };
    localStorage.setItem('voiceInterviewState', JSON.stringify(stateToSave));
  };
  
  const speakText = (text: string) => {
    if (isMuted || !speechSynthesisRef.current) return;
    
    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Track speaking state
    setIsSpeaking(true);
    
    // Start recording after the AI finishes speaking
    utterance.onend = () => {
      setIsSpeaking(false);
      // Small delay before starting recording
      setTimeout(() => {
        if (!isPaused) {
          startUserResponse();
        }
      }, 500);
    };
    
    speechSynthesisRef.current.speak(utterance);
  };
  
  const startUserResponse = () => {
    // Add a new user message placeholder
    setMessages(prev => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        role: 'user',
        content: '',
        isComplete: false
      }
    ]);
    
    // Start recording
    startListening();
  };
  
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (speechSynthesisRef.current) {
      if (!isMuted) {
        speechSynthesisRef.current.cancel();
      } else if (!isListening && !isPaused) {
        // If unmuting and not currently listening, repeat the current question
        speakText(INTERVIEW_QUESTIONS[currentQuestionIndex]);
      }
    }
  };
  
  const handlePauseResume = () => {
    if (isPaused) {
      // Resuming
      setIsPaused(false);
      if (!isListening && !isMuted) {
        speakText(INTERVIEW_QUESTIONS[currentQuestionIndex]);
      }
    } else {
      // Pausing
      setIsPauseDialogOpen(true);
      if (isListening) {
        stopListening();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
        setIsSpeaking(false);
      }
    }
  };
  
  const confirmPause = () => {
    setIsPaused(true);
    setIsPauseDialogOpen(false);
    saveInterviewState();
  };
  
  const handleSkipQuestion = () => {
    if (isListening) {
      stopListening();
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
    goToNextQuestion();
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1) {
      if (isListening) {
        stopListening();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
        setIsSpeaking(false);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Handle interview completion
      handleInterviewComplete();
    }
  };
  
  const handleInterviewComplete = () => {
    setInterviewComplete(true);
    localStorage.removeItem('voiceInterviewState'); // Clear saved state
    setIsLoading(true);
    
    // Simulate sending data to server
    setTimeout(() => {
      setIsLoading(false);
      navigate('/interview-complete', { 
        state: { 
          responses,
          sessionId,
          completedAt: new Date().toISOString()
        } 
      });
    }, 2000);
  };
  
  const startInterview = () => {
    setShowWelcome(false);
    // Add welcome message
    setMessages([
      {
        id: `ai_${Date.now()}`,
        role: 'ai',
        content: "Welcome to the PersonaAI interview. I'll be asking you a series of questions to help build your persona. Let's start with the first question.",
        isComplete: true
      }
    ]);
    
    // Start the first question after a brief delay
    setTimeout(() => {
      if (!isPaused) {
        speakText(INTERVIEW_QUESTIONS[currentQuestionIndex]);
      }
    }, 1000);
  };

  // Welcome screen
  if (showWelcome) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">PersonaAI Voice Interview</h1>
        
        <div className="bg-card rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome to your Voice Interview</h2>
          <p className="text-muted-foreground mb-6">
            You'll be speaking with our AI interviewer to help build your persona for research purposes. 
            The interview consists of {INTERVIEW_QUESTIONS.length} questions and should take about 10-15 minutes.
          </p>
          
          <div className="space-y-4 text-left bg-muted/30 p-4 rounded-md mb-6">
            <h3 className="font-medium">Before we begin:</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Please ensure you're in a quiet environment</li>
              <li>Your browser will request microphone access</li>
              <li>You can pause the interview at any time</li>
              <li>Your responses will be saved securely</li>
              <li>Speak clearly and take your time with answers</li>
            </ul>
          </div>
          
          <Button 
            size="lg" 
            className="w-full"
            onClick={startInterview}
          >
            <Mic className="mr-2 h-5 w-5" />
            Start Voice Interview
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          By proceeding, you consent to the collection and processing of your voice data
          in accordance with our privacy policy.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 h-screen flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-4">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }} 
        />
      </div>
      
      <div className="flex justify-between items-center mb-4">
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
      
      {/* Conversation display */}
      <div className="flex-grow overflow-hidden flex flex-col bg-card rounded-lg border shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">AI Interview Session</h2>
          <div className="flex items-center gap-2">
            {isListening && (
              <span className="text-xs bg-blue-500/10 text-blue-500 py-1 px-2 rounded-full flex items-center">
                <span className="h-2 w-2 bg-blue-500 rounded-full mr-1 animate-pulse"></span>
                Listening
              </span>
            )}
            {isSpeaking && (
              <span className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full flex items-center">
                <span className="h-2 w-2 bg-primary rounded-full mr-1 animate-pulse"></span>
                Speaking
              </span>
            )}
          </div>
        </div>
        
        <ConversationDisplay 
          messages={messages}
          isSpeaking={isSpeaking}
          isListening={isListening}
          className="flex-grow"
        />
        
        <div className="p-4 border-t">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={isListening || isSpeaking}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Exit
            </Button>
            
            {isListening ? (
              <Button 
                variant="destructive" 
                onClick={stopListening}
              >
                <MicOff className="h-4 w-4 mr-1" /> Stop Recording
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleSkipQuestion}
                disabled={isPaused || isSpeaking}
              >
                <SkipForward className="h-4 w-4 mr-1" /> Skip Question
              </Button>
            )}
          </div>
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
