
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Pause, Play, 
  Volume2, VolumeX, Clock,
  ArrowLeft, SkipForward, RefreshCw,
  Bot, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { ConversationDisplay, Message } from "@/components/interview/ConversationDisplay";
import { useToast } from "@/hooks/use-toast";
import { AudioWave } from "@/components/ui/audio-wave";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [showTranscription, setShowTranscription] = useState<boolean>(false);
  const [interviewTime, setInterviewTime] = useState<number>(0);
  const [qualityScore, setQualityScore] = useState<number>(0);

  // Refs
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  
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
            
            // Increase quality score when question is answered
            const newQualityScore = Math.min(
              100, 
              qualityScore + Math.floor(100 / INTERVIEW_QUESTIONS.length) + Math.floor(Math.random() * 5)
            );
            setQualityScore(newQualityScore);
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
  
  // Format interview time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize speech synthesis and timer
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    
    // Load interview state from local storage
    loadInterviewState();
    
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, []);
  
  // Interview timer
  useEffect(() => {
    if (!showWelcome && !isPaused && !interviewComplete) {
      timerIntervalRef.current = window.setInterval(() => {
        setInterviewTime(prev => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
    }
    
    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, [showWelcome, isPaused, interviewComplete]);
  
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
        
        // Calculate quality score based on completed questions
        const newQualityScore = Math.min(
          100, 
          Math.floor((parsedState.completedQuestions.length / INTERVIEW_QUESTIONS.length) * 100)
        );
        setQualityScore(newQualityScore);
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
  
  const replayCurrentQuestion = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      setTimeout(() => {
        speakText(INTERVIEW_QUESTIONS[currentQuestionIndex]);
      }, 300);
    }
  };
  
  const toggleTranscription = () => {
    setShowTranscription(!showTranscription);
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
      <div className="container max-w-2xl mx-auto py-12 px-4 text-center bg-[#1a1a1a] min-h-screen flex flex-col items-center justify-center text-[#f5f5f5]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#2a2a2a] opacity-50"></div>
        
        <div className="relative z-10 w-full">
          <h1 className="text-3xl font-bold mb-6 text-[#f5f5f5] flex items-center justify-center gap-2">
            <span className="text-[#3b82f6]">Persona</span>AI Voice Interview
          </h1>
          
          <div className="bg-[#2a2a2a] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-8 mb-8 border border-[#3b82f6]/10">
            <h2 className="text-xl font-semibold mb-4 text-[#f5f5f5]">Welcome to your Voice Interview</h2>
            <p className="text-[#a0a0a0] mb-6">
              You'll be speaking with our AI interviewer to help build your persona for research purposes. 
              The interview consists of {INTERVIEW_QUESTIONS.length} questions and should take about 10-15 minutes.
            </p>
            
            <div className="space-y-4 text-left bg-[#1a1a1a]/50 p-4 rounded-md mb-6 border border-[#3b82f6]/5">
              <h3 className="font-medium text-[#f5f5f5]">Before we begin:</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[#a0a0a0]">
                <li>Please ensure you're in a quiet environment</li>
                <li>Your browser will request microphone access</li>
                <li>You can pause the interview at any time</li>
                <li>Your responses will be saved securely</li>
                <li>Speak clearly and take your time with answers</li>
              </ul>
            </div>
            
            <Button 
              size="lg" 
              className="w-full bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              onClick={startInterview}
            >
              <Mic className="mr-2 h-5 w-5" />
              Start Voice Interview
            </Button>
          </div>
          
          <p className="text-sm text-[#a0a0a0]">
            By proceeding, you consent to the collection and processing of your voice data
            in accordance with our privacy policy.
          </p>
          
          <div className="absolute bottom-2 right-2 opacity-30 text-[#3b82f6]">
            <span className="text-xs">PersonaAI</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f5f5f5] flex flex-col">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyYTJhMmEiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 pointer-events-none"></div>
      
      <div className="container max-w-3xl mx-auto py-8 px-4 h-screen flex flex-col relative z-10">
        {/* Top Bar */}
        <div className="bg-[#2a2a2a] rounded-lg border border-[#3b82f6]/10 shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-[#a0a0a0] flex items-center">
                <Clock className="h-4 w-4 mr-1 text-[#3b82f6]" />
                <span>{formatTime(interviewTime)}</span>
              </div>
              
              <div className="h-4 w-px bg-[#3b82f6]/20"></div>
              
              <div className="text-sm text-[#a0a0a0]">
                Question <span className="text-[#f5f5f5]">{currentQuestionIndex + 1}</span> of {INTERVIEW_QUESTIONS.length}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTranscription}
                className="text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#3b82f6]/10"
              >
                {showTranscription ? "Hide" : "Show"} Transcript
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleToggleMute}
                className={`hover:bg-[#3b82f6]/10 ${isMuted ? 'text-red-400 hover:text-red-300' : 'text-[#a0a0a0] hover:text-[#f5f5f5]'}`}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePauseResume}
                className={`hover:bg-[#3b82f6]/10 ${isPaused ? 'text-[#3b82f6]' : 'text-[#a0a0a0] hover:text-[#f5f5f5]'}`}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-1.5 bg-[#2a2a2a]" />
          </div>
        </div>
        
        {/* Quality meter */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xs text-[#a0a0a0]">Persona Quality</div>
          <div className="flex-1 mx-3">
            <div className="w-full bg-[#2a2a2a] rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-[#3b82f6]/40 to-[#3b82f6]" style={{ width: `${qualityScore}%` }}></div>
            </div>
          </div>
          <div className="text-xs font-medium text-[#f5f5f5]">{qualityScore}%</div>
        </div>
        
        {/* Avatar-centric view */}
        <div className="flex-grow overflow-hidden flex flex-col bg-[#2a2a2a] rounded-lg border border-[#3b82f6]/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="p-4 border-b border-[#3b82f6]/10 flex justify-between items-center">
            <h2 className="font-semibold text-[#f5f5f5] flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-[#3b82f6] mr-2 animate-pulse"></span>
              AI Interview Session
            </h2>
            <div className="flex items-center gap-2">
              {isListening && (
                <span className="text-xs bg-[#3b82f6]/10 text-[#3b82f6] py-1 px-2 rounded-full flex items-center">
                  <span className="h-2 w-2 bg-[#3b82f6] rounded-full mr-1 animate-pulse"></span>
                  Recording
                </span>
              )}
              {isSpeaking && (
                <span className="text-xs bg-[#3b82f6]/10 text-[#3b82f6] py-1 px-2 rounded-full flex items-center">
                  <span className="h-2 w-2 bg-[#3b82f6] rounded-full mr-1 animate-pulse"></span>
                  Speaking
                </span>
              )}
              {isPaused && (
                <span className="text-xs bg-yellow-500/10 text-yellow-500 py-1 px-2 rounded-full flex items-center">
                  <Pause className="h-3 w-3 mr-1" />
                  Paused
                </span>
              )}
            </div>
          </div>
          
          {showTranscription ? (
            <ConversationDisplay 
              messages={messages}
              isSpeaking={isSpeaking}
              isListening={isListening}
              className="flex-grow scrollbar-thin scrollbar-thumb-[#3b82f6]/10 scrollbar-track-transparent"
            />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
              {/* AI Avatar */}
              <div className="mb-6 relative">
                <Avatar className="h-64 w-64 mx-auto shadow-lg relative">
                  <div className="absolute inset-0 rounded-full bg-[#3b82f6]/5 animate-pulse" 
                       style={{
                         boxShadow: isSpeaking 
                           ? '0 0 40px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2) inset' 
                           : '0 0 20px rgba(59, 130, 246, 0.2)'
                       }}>
                  </div>
                  <AvatarFallback className="bg-[#2a2a2a] text-[#3b82f6] text-5xl font-light border-2 border-[#3b82f6]/30">
                    <Bot size={100} strokeWidth={1} />
                  </AvatarFallback>
                </Avatar>
                
                {/* Voice wave around avatar when speaking */}
                {isSpeaking && (
                  <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
                    <AudioWave 
                      isActive={true} 
                      type="speaking" 
                      color="bg-[#3b82f6]" 
                      className="scale-150" 
                    />
                  </div>
                )}
                
                {/* Mic indicator when listening */}
                {isListening && (
                  <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
                    <AudioWave 
                      isActive={true} 
                      type="listening" 
                      color="bg-[#3b82f6]" 
                      className="scale-150" 
                    />
                  </div>
                )}
              </div>
              
              {/* Current Question Display */}
              <div className="max-w-xl mx-auto mb-6 animate-fade-in">
                <h3 className="text-xl font-medium text-[#f5f5f5] mb-3">
                  {INTERVIEW_QUESTIONS[currentQuestionIndex]}
                </h3>
                
                <p className="text-sm text-[#a0a0a0]">
                  {isSpeaking ? 
                    "Please listen to the question..." : 
                    isListening ? 
                      "Please speak clearly into your microphone to respond." : 
                      "Preparing next question..."
                  }
                </p>
              </div>
            </div>
          )}
          
          {/* Bottom controls bar */}
          <div className="p-4 border-t border-[#3b82f6]/10">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => navigate('/pre-interview-questionnaire')}
                disabled={isListening || isSpeaking}
                className="border-[#3b82f6]/20 hover:bg-[#3b82f6]/5 text-[#a0a0a0] hover:text-[#f5f5f5]"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Exit
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                <Clock className="h-4 w-4 text-[#3b82f6]" />
                <span>{formatTime(interviewTime)}</span>
                <span className="text-[#a0a0a0]/50">/</span>
                <span>~15:00</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={replayCurrentQuestion}
                  disabled={isPaused || isSpeaking}
                  className="border-[#3b82f6]/20 hover:bg-[#3b82f6]/5 text-[#a0a0a0] hover:text-[#f5f5f5]"
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Replay
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
                    className="border-[#3b82f6]/20 hover:bg-[#3b82f6]/5 text-[#a0a0a0] hover:text-[#f5f5f5]"
                  >
                    <SkipForward className="h-4 w-4 mr-1" /> Skip Question
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2 opacity-30 text-[#3b82f6]">
          <span className="text-xs">PersonaAI</span>
        </div>
      </div>
      
      {/* Pause dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent className="bg-[#2a2a2a] text-[#f5f5f5] border border-[#3b82f6]/10">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f5]">Pause Interview?</DialogTitle>
            <DialogDescription className="text-[#a0a0a0]">
              Your progress will be saved and you can continue later from this question.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsPauseDialogOpen(false)}
              className="text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#3b82f6]/5"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmPause}
              className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white"
            >
              Pause Interview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#1a1a1a]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="relative inline-block h-12 w-12 mb-4">
              <div className="absolute h-12 w-12 rounded-full border-4 border-[#3b82f6] border-opacity-20"></div>
              <div className="absolute h-12 w-12 rounded-full border-4 border-transparent border-t-[#3b82f6] animate-spin"></div>
            </div>
            <p className="font-medium text-[#f5f5f5]">Submitting your interview responses...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInterviewSession;
