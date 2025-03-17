import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mic, Play, SkipForward, VolumeX, Volume2, X, MicOff, RefreshCw } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Reveal from "@/components/ui-custom/Reveal";
import ApiKeyManager from "@/components/ApiKeyManager";
import { useInterviewSession, InterviewState, Message } from "@/hooks/useInterviewSession";
import { generateResponse } from "@/services/ai/openaiService";
import { getApiKey } from "@/services/utils/apiKeyUtils";
import { Switch } from "@/components/ui/switch";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Badge } from "@/components/ui/badge";

const STANDARD_QUESTIONS = [
  "What's your name and what do you do for work?",
  "What brings you here today? What problem are you trying to solve?",
  "Could you describe your typical day and how this problem affects it?",
  "Have you tried any solutions to this problem before? How did they work out?",
  "What would an ideal solution look like for you?",
  "How do you make decisions about products or services like this?",
  "What factors are most important to you when choosing a solution?",
  "Is there anything else you'd like to share about your needs or expectations?"
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
    }
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
    initialQuestions: STANDARD_QUESTIONS,
    onComplete: handleInterviewComplete,
    useVoice
  });

  useEffect(() => {
    if (apiKey && interviewState === InterviewState.IDLE && !showApiKeyInput) {
      console.log("Starting interview with API key");
      startInterview();
    }
  }, [apiKey, interviewState, showApiKeyInput, startInterview]);

  async function handleInterviewComplete(transcript: Message[]) {
    setIsLoading(true);
    
    try {
      await generateAiSummary(transcript);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please check your API key or try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }

  const generateAiSummary = async (interviewMessages: Message[]) => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      setIsLoading(false);
      return;
    }

    const userResponses = interviewMessages.filter(m => m.role === "user").map(m => m.content);
    const aiQuestions = interviewMessages.filter(m => m.role === "ai").map(m => m.content);
    
    const prompt = `
    You are an expert qualitative researcher analyzing an interview.
    
    Interview questions:
    ${aiQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}
    
    Responses:
    ${userResponses.map((r, i) => `Response ${i+1}: ${r}`).join('\n')}
    
    Based on this interview, generate a detailed qualitative analysis including:
    1. Key insights and themes
    2. Needs, pain points, and motivations
    3. Recommendations based on the responses
    4. A brief persona description that summarizes who this person is and what they care about
    
    Format your analysis with markdown headings and bullet points for easy reading.
    `;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert qualitative researcher who analyzes interview responses to generate insights."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to connect to OpenAI");
      }

      const data = await response.json();
      const generatedSummary = data.choices[0].message.content;
      
      setSummary(generatedSummary);
      setIsLoading(false);
      toast({
        title: "Success",
        description: "AI summary generated successfully",
      });
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      const basicSummary = `Based on your responses, we've identified the following key points:\n\n` +
        `- You've shared ${userResponses.length} responses that help us understand your perspective\n` +
        `- We can now build a persona based on this information\n\n` +
        `Note: This is a basic summary as there was an issue connecting to the AI service. Please check your API key or try again later.`;
      
      setSummary(basicSummary);
      
      toast({
        title: "Limited Functionality",
        description: "Using basic summary due to API connection issues",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyUpdate = (newApiKey: string | null) => {
    if (newApiKey) {
      console.log("API key updated, starting interview");
      setApiKey(newApiKey);
      setShowApiKeyInput(false);
      setTimeout(() => {
        startInterview();
      }, 100);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-[#1a1a1a] flex flex-col">
        <div className="container max-w-4xl mx-auto px-4 py-12 flex-grow flex flex-col items-center justify-center">
          {showApiKeyInput ? (
            <div className="bg-card p-6 rounded-lg border w-full max-w-md">
              <h3 className="font-medium mb-4 text-xl">OpenAI API Key Required</h3>
              <p className="text-sm text-muted-foreground mb-6">
                To use the AI interviewer, please provide your OpenAI API key. This key is required for processing audio and generating questions.
              </p>
              <ApiKeyManager onApiKeyUpdate={handleApiKeyUpdate} />
              
              <div className="mt-6 flex items-center space-x-2 pt-4 border-t">
                <Switch 
                  id="voice-toggle" 
                  checked={useVoice} 
                  onCheckedChange={toggleVoice} 
                />
                <label htmlFor="voice-toggle" className="cursor-pointer flex items-center">
                  {useVoice ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                  {useVoice ? "Voice enabled" : "Voice disabled"}
                </label>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getMicStatusColor()} mr-2`}></div>
                    <span className="text-sm">{getMicStatusText()}</span>
                  </div>
                  <Button onClick={testMicrophone} size="sm" variant={testAudioRecorder.isRecording ? "destructive" : "outline"}>
                    {testAudioRecorder.isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Test
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Test Mic
                      </>
                    )}
                  </Button>
                </div>
                
                {testAudioRecorder.isRecording && (
                  <canvas 
                    ref={audioVisualizer}
                    width="300"
                    height="60"
                    className="w-full h-[60px] bg-black/20 rounded-md mb-2"
                  ></canvas>
                )}
                
                {testAudioRecorder.error && (
                  <div className="text-red-500 text-sm mt-2">
                    Error: {testAudioRecorder.error.message}
                  </div>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center space-y-6">
              <Reveal>
                <h2 className="text-2xl font-bold text-white">Interview Complete</h2>
              </Reveal>
              <Reveal delay={100}>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-white/80">Analyzing your responses...</p>
              </Reveal>
            </div>
          ) : isCompleted && summary ? (
            <div className="w-full space-y-6">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-medium mb-2 text-xl">Interview Summary</h3>
                <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }} />
                </div>
                <div className="mt-8 space-y-4">
                  <Button className="w-full">Save Persona</Button>
                  <Link to="/persona-ai-interviewer">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Interviewer
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center max-w-xl w-full mb-12">
                <div className="relative mb-10">
                  <Avatar className={`w-64 h-64 rounded-full ${interviewState === InterviewState.SPEAKING ? 'animate-pulse' : ''}`}>
                    <AvatarImage
                      src="/lovable-uploads/0082cb4d-cc17-46da-8c05-508924cdc668.png"
                      alt="AI Avatar"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-4xl">AI</AvatarFallback>
                  </Avatar>
                  
                  {useVoice && (
                    <div className="absolute bottom-4 right-4 bg-black/60 p-2 rounded-full">
                      <Volume2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`absolute inset-0 rounded-full ring-4 ring-primary shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-opacity duration-500 ${
                    interviewState === InterviewState.SPEAKING ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                  
                  {interviewState === InterviewState.LISTENING && (
                    <div className="absolute top-0 right-0">
                      <Badge variant={testAudioRecorder.microphoneAccess ? "default" : "destructive"}>
                        {testAudioRecorder.microphoneAccess ? (
                          <Mic className="h-3 w-3 mr-1 animate-pulse text-green-300" />
                        ) : (
                          <MicOff className="h-3 w-3 mr-1 text-red-300" />
                        )}
                        {testAudioRecorder.microphoneAccess ? "Mic Active" : "Mic Issue"}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <Reveal animation="fade-in-up">
                  <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm border border-white/10 max-w-2xl">
                    <h2 className="text-2xl text-center text-white font-medium mb-2 max-w-[600px] mx-auto">
                      {currentQuestionText}
                    </h2>
                    
                    <div className="text-center mt-4 text-white/70 text-sm">
                      {interviewState === InterviewState.SPEAKING && (
                        <div className="flex items-center justify-center">
                          <Play className="h-4 w-4 mr-2 text-primary animate-pulse" />
                          <span>AI is speaking...</span>
                        </div>
                      )}
                      
                      {interviewState === InterviewState.LISTENING && (
                        <div className="flex items-center justify-center">
                          <Mic className="h-4 w-4 mr-2 text-red-400 animate-pulse" />
                          <span>Listening to your response...</span>
                        </div>
                      )}
                      
                      {interviewState === InterviewState.PROCESSING && (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin mr-2"></div>
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
                
                {showDebugging && (
                  <div className="mt-6 bg-black/50 p-4 rounded-lg border border-white/10 w-full">
                    <h3 className="text-white font-medium mb-2">Debug Info</h3>
                    <div className="text-xs text-white/70 space-y-1 font-mono">
                      <div>State: {interviewState}</div>
                      <div>Mic Access: {testAudioRecorder.microphoneAccess ? "Granted" : "Not Granted"}</div>
                      <div>Recording: {isRecording ? "Yes" : "No"}</div>
                      <div>Messages: {messages.length}</div>
                      <div>Current Q: {currentQuestion}</div>
                      <div>API Key: {apiKey ? "Set" : "Not Set"}</div>
                      <div>Voice: {useVoice ? "Enabled" : "Disabled"}</div>
                      {testAudioRecorder.error && (
                        <div className="text-red-400">Error: {testAudioRecorder.error.message}</div>
                      )}
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={testMicrophone}>
                        {testAudioRecorder.isRecording ? "Stop Test" : "Test Mic"}
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={testAudioRecorder.checkMicrophoneStatus}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Check Mic
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-full fixed bottom-0 left-0 bg-black/60 backdrop-blur-md p-4 border-t border-white/10">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={handleExit}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Exit
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      className="border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={replayQuestion}
                      disabled={interviewState !== InterviewState.LISTENING}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Replay
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={skipQuestion}
                      disabled={!canSkip || interviewState !== InterviewState.LISTENING}
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip
                    </Button>
                    
                    <div className="flex items-center ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/80 hover:text-white"
                        onClick={toggleVoice}
                        disabled={interviewState !== InterviewState.IDLE}
                      >
                        {useVoice ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/80 hover:text-white"
                        onClick={toggleDebugging}
                      >
                        <span className="text-xs font-mono">{showDebugging ? "Hide Debug" : "Debug"}</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-white/80 font-mono">
                    {formatTime(elapsedTime)} / 60:00
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InterviewProcess;




