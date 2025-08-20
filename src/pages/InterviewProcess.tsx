import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mic, Play, SkipForward, VolumeX, Volume2, X, MicOff, RefreshCw, Headphones } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Reveal from "@/components/ui-custom/Reveal";
import ApiKeyManager from "@/components/ApiKeyManager";
import OpenAITester from "@/components/OpenAITester";
import { useInterviewSession, InterviewState, Message } from "@/hooks/useInterviewSession";
import { getApiKey } from "@/services/utils/apiKeyUtils";
import { Switch } from "@/components/ui/switch";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Badge } from "@/components/ui/badge";
import { stopAnyPlayingAudio } from "@/services/ai/textToSpeechService";

const INTERVIEW_QUESTIONS = [
  "Thank you for joining. We are here to understand how you think, make decisions, and approach different areas of life. There are no right or wrong answers. Just speak naturally and share your experiences. Let's begin.",
  "Tell me the story of your life in your own words.",
  "What were the biggest turning points in your life, moments when everything changed?",
  "Who or what has had the biggest influence on shaping who you are today?",
  "Have you ever made a decision that felt small at the time but turned out to be life-changing?",
  "Tell me about your first job. What did you learn from it?",
  "What motivates you to work beyond earning money?",
  "Have you ever struggled financially? What was that experience like for you?",
  "What are the three most important values in your life?",
  "Have your values changed over time? If so, what influenced that change?",
  "How do you decide who to trust?",
  "How do you typically approach big decisions—quick gut feeling or careful analysis?",
  "What is the hardest decision you have ever had to make?",
  "Do you believe in taking big risks for big rewards, or do you prefer playing it safe?",
  "Tell me about a time when you had to stay calm under pressure.",
  "What is your go-to coping mechanism when life becomes difficult?",
  "Do you prefer handling problems alone, or do you ask for help?",
  "Where do you see yourself in five years?",
  "What is the biggest lesson life has taught you?",
  "What does success mean to you?"
];

const InterviewProcess = () => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [participantData, setParticipantData] = useState<any>(null);
  const [useVoice, setUseVoice] = useState(true);
  const [showDebugging, setShowDebugging] = useState(false);
  const [microphoneStatus, setMicrophoneStatus] = useState<string>("unknown");
  const [silenceThreshold, setSilenceThreshold] = useState(15);
  const [silenceTimeout, setSilenceTimeout] = useState(2500);
  const [silenceDetectionEnabled, setSilenceDetectionEnabled] = useState(true);
  const [useHeadphones, setUseHeadphones] = useState<boolean>(false);
  const [recordingDelay, setRecordingDelay] = useState(800);
  const audioVisualizer = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const testAudioRecorder = useAudioRecorder({
    debug: true,
    onComplete: (blob) => {
      console.log("Test recording complete", blob.size, "bytes");
      if (blob.size > 0) {
        toast({
          title: "Test Recording",
          description: `Successfully recorded ${Math.round(blob.size / 1024)} KB of audio`,
        });
        
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        toast({
          title: "Test Recording Failed",
          description: "No audio data was captured. Please check your microphone.",
          variant: "destructive"
        });
      }
    },
    silenceDetectionEnabled,
    silenceThreshold,
    silenceTimeout
  });

  useEffect(() => {
    if (location.state?.participantData) {
      setParticipantData(location.state.participantData);
    }
  }, [location]);

  useEffect(() => {
    const storedApiKey = getApiKey('openai');
    if (storedApiKey) {
      console.log("API key found in storage, validating...");
      setApiKey(storedApiKey);
    } else {
      console.log("No API key found, showing input form");
      setShowApiKeyInput(true);
    }
  }, []);

  useEffect(() => {
    const checkMic = async () => {
      try {
        const result = await testAudioRecorder.checkMicrophoneStatus();
        setMicrophoneStatus(result ? "ready" : "unavailable");
      } catch (err) {
        console.error("Error checking microphone:", err);
        setMicrophoneStatus("error");
      }
    };
    
    checkMic();
  }, [testAudioRecorder]);

  useEffect(() => {
    if (!audioVisualizer.current || !testAudioRecorder.isRecording) return;
    
    let animationFrame: number;
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let dataArray: Uint8Array;
    
    const setupVisualizer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        const canvas = audioVisualizer.current;
        if (!canvas) return;
        
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;
        
        const draw = () => {
          if (!canvas) return;
          
          animationFrame = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          
          canvasCtx.fillStyle = 'rgb(20, 20, 20)';
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
          
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let x = 0;
          
          for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 100, 200)`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
        };
        
        draw();
      } catch (err) {
        console.error("Error setting up audio visualizer:", err);
      }
    };
    
    setupVisualizer();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [testAudioRecorder.isRecording]);

  const {
    interviewState,
    messages,
    currentQuestion,
    elapsedTime,
    canSkip,
    isCompleted,
    isRecording,
    startInterview,
    skipQuestion,
    replayQuestion,
    stopInterview
  } = useInterviewSession({
    participantId: participantData?.id,
    initialQuestions: INTERVIEW_QUESTIONS,
    onComplete: handleInterviewComplete,
    useVoice,
    silenceDetectionEnabled,
    silenceThreshold,
    silenceTimeout,
    recordingDelay: useHeadphones ? 300 : recordingDelay
  });

  useEffect(() => {
    console.log(`Interview state changed to: ${InterviewState[interviewState]}`);
    if (interviewState === InterviewState.PROCESSING) {
      console.log('Processing user response...');
    }
  }, [interviewState]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log(`New message (${lastMessage.role}): "${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}"`);
    }
  }, [messages]);

  useEffect(() => {
    if (apiKey && interviewState === InterviewState.IDLE && !showApiKeyInput) {
      console.log("Starting interview with API key");
      startInterview();
    }
  }, [apiKey, interviewState, showApiKeyInput, startInterview]);

  async function handleInterviewComplete(transcript: Message[]) {
    setIsLoading(true);
    
    try {
      console.log('Interview functionality is currently disabled');
      toast({
        title: "Interview Disabled",
        description: "Interview functionality is currently not available.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Interview functionality is currently disabled.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const generateAiSummary = async (interviewMessages: Message[]) => {
    console.log('Interview functionality is currently disabled');
  };

  const handleApiKeyUpdate = (newApiKey: string | null) => {
    if (newApiKey) {
      console.log("API key updated");
      setApiKey(newApiKey);
      setShowApiKeyInput(false);
    } else {
      console.log("API key cleared");
    }
  };

  const handleExit = () => {
    navigate("/persona-ai-interviewer");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVoice = () => {
    if (interviewState === InterviewState.IDLE) {
      setUseVoice(!useVoice);
    } else {
      toast({
        title: "Voice Settings",
        description: "Voice settings cannot be changed during an active interview.",
        variant: "default"
      });
    }
  };

  const toggleSilenceDetection = () => {
    if (interviewState === InterviewState.IDLE) {
      setSilenceDetectionEnabled(!silenceDetectionEnabled);
    } else {
      toast({
        title: "Settings",
        description: "Settings cannot be changed during an active interview.",
        variant: "default"
      });
    }
  };

  const currentQuestionText = messages.length > 0 
    ? messages[messages.length - 1]?.role === 'ai' 
      ? messages[messages.length - 1]?.content 
      : "" 
    : "";

  const testMicrophone = () => {
    if (testAudioRecorder.isRecording) {
      testAudioRecorder.stopRecording();
    } else {
      toast({
        title: "Testing Microphone",
        description: "Recording for 5 seconds to test your microphone...",
      });
      
      testAudioRecorder.startRecording();
      
      setTimeout(() => {
        if (testAudioRecorder.isRecording) {
          testAudioRecorder.stopRecording();
        }
      }, 5000);
    }
  };

  const toggleDebugging = () => {
    setShowDebugging(!showDebugging);
  };

  const getMicStatusColor = () => {
    switch (microphoneStatus) {
      case "ready":
        return "bg-green-500";
      case "unavailable":
        return "bg-red-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getMicStatusText = () => {
    switch (microphoneStatus) {
      case "ready":
        return "Microphone Ready";
      case "unavailable":
        return "Microphone Unavailable";
      case "error":
        return "Microphone Error";
      default:
        return "Checking Microphone...";
    }
  };

  useEffect(() => {
    return () => {
      stopAnyPlayingAudio();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-[#1a1a1a] flex flex-col">
        <div className="container max-w-4xl mx-auto px-4 py-12 pt-24 flex-grow flex flex-col items-center justify-center">
          <div className="bg-card p-6 rounded-lg border w-full max-w-md text-center">
            <h3 className="font-medium mb-4 text-xl">Interview Feature Temporarily Disabled</h3>
            <p className="text-sm text-muted-foreground mb-6">
              The interview functionality is currently being updated and is not available. 
              Please check back later or use the persona creation tools instead.
            </p>
            <Link to="/persona-ai-interviewer">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Interviewer
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InterviewProcess;
