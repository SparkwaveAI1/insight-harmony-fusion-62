
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Pre-defined interview questions
const INTERVIEW_QUESTIONS = [
  "Tell me a bit about yourself and your background.",
  "What topics or issues are you most passionate about?",
  "How do you usually make important decisions in your life?",
  "What's a challenge you've faced recently and how did you handle it?",
  "What are your thoughts on how technology is changing society?",
  "If you could change one thing about the world, what would it be?",
  "What's something you believe that most people might disagree with?",
  "What are your hopes or concerns about the future?",
];

const AIVoiceInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [responses, setResponses] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const email = location.state?.email || "";
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    // Calculate interview progress
    setProgress((currentQuestion / INTERVIEW_QUESTIONS.length) * 100);
  }, [currentQuestion]);
  
  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      toast({
        title: "Error",
        description: "Please start from the beginning of the interview process.",
        variant: "destructive",
      });
      navigate("/interview-landing");
    }
    
    // Play first question when component mounts
    const timeout = setTimeout(() => {
      speakQuestion(INTERVIEW_QUESTIONS[0]);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  const speakQuestion = (question: string) => {
    // Simulate AI speaking (would be replaced with actual TTS API call)
    const speech = new SpeechSynthesisUtterance(question);
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = isMuted ? 0 : 1;
    window.speechSynthesis.speak(speech);
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording logic
      setIsRecording(false);
      // In a real implementation, you would stop the recording and process the audio
      // Simulating a transcription after a delay
      setIsProcessing(true);
      setTimeout(() => {
        const simulatedResponse = `This is a simulated response to question ${currentQuestion + 1}.`;
        setTranscription(simulatedResponse);
        setIsProcessing(false);
      }, 1500);
    } else {
      // Start recording logic
      setIsRecording(true);
      // In a real implementation, you would start recording the user's voice
      setTranscription("");
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };
  
  const handleNextQuestion = () => {
    // Save current response
    setResponses([...responses, transcription]);
    setTranscription("");
    
    // Move to next question or complete interview
    if (currentQuestion < INTERVIEW_QUESTIONS.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      
      // Play next question after a short delay
      setTimeout(() => {
        speakQuestion(INTERVIEW_QUESTIONS[nextQuestion]);
      }, 500);
    } else {
      // Interview is complete
      setIsInterviewComplete(true);
      setShowApiKeyInput(true);
    }
  };
  
  const handleSubmitApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to generate a summary",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processing Interview",
      description: "Your interview is being analyzed. This may take a moment.",
    });
    
    // In a real implementation, you would send the responses to an API for processing
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Your AI persona has been created based on your interview.",
      });
      // Navigate to a results page
      navigate("/interview-process", { state: { email, responses } });
    }, 2000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="pt-24 pb-16">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Step 3: AI Voice Interview
                </p>
              </Reveal>
              
              <Reveal delay={100}>
                <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl font-plasmik">
                  PersonaAI Voice Interview
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Let's have a conversation to better understand your perspective. Our AI will ask you
                  questions and record your verbal responses.
                </p>
              </Reveal>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Card className="p-6 md:p-8 bg-card border shadow-md">
                {!isInterviewComplete ? (
                  <>
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Question {currentQuestion + 1} of {INTERVIEW_QUESTIONS.length}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={toggleMute}
                          className="h-8 w-8 p-0"
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                      <h3 className="font-medium mb-2">Question:</h3>
                      <p className="text-lg">{INTERVIEW_QUESTIONS[currentQuestion]}</p>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="font-medium mb-2">Your Response:</h3>
                      {isProcessing ? (
                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : transcription ? (
                        <div className="bg-card border rounded-lg p-4">
                          <p>{transcription}</p>
                        </div>
                      ) : (
                        <div className="border border-dashed border-muted-foreground/40 rounded-lg p-6 text-center">
                          <p className="text-muted-foreground">
                            {isRecording ? "Listening..." : "Click the microphone button to start recording your answer"}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (currentQuestion > 0) {
                            setCurrentQuestion(currentQuestion - 1);
                            setTranscription(responses[currentQuestion - 1] || "");
                            setResponses(responses.slice(0, -1));
                          } else {
                            navigate(-1);
                          }
                        }}
                        disabled={isRecording || isProcessing}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {currentQuestion === 0 ? "Back to Questionnaire" : "Previous Question"}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          variant={isRecording ? "destructive" : "secondary"}
                          className="rounded-full h-12 w-12 p-0"
                          onClick={toggleRecording}
                          disabled={isProcessing}
                        >
                          {isRecording ? (
                            <MicOff className="h-5 w-5" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <Button
                          onClick={handleNextQuestion}
                          disabled={!transcription || isRecording || isProcessing}
                        >
                          {currentQuestion < INTERVIEW_QUESTIONS.length - 1 ? (
                            "Next Question"
                          ) : (
                            "Complete Interview"
                          )}
                          <Send className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Interview Complete!</h2>
                    <p className="mb-8">
                      Thank you for completing the AI voice interview. Your responses will be used to create
                      a personalized AI avatar that reflects your perspective and insights.
                    </p>
                    
                    {showApiKeyInput && (
                      <div className="bg-muted/30 p-6 rounded-lg mb-6 text-left">
                        <h3 className="font-medium mb-2">OpenAI API Key Required</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          To generate an AI summary of your interview and create your persona,
                          please enter your OpenAI API key:
                        </p>
                        <input
                          type="password"
                          className="w-full p-2 border rounded mb-4"
                          placeholder="sk-..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                        <Button
                          onClick={handleSubmitApiKey}
                          className="w-full"
                          disabled={!apiKey.trim()}
                        >
                          Create My AI Persona
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/")}
                      >
                        Return to Home
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
      
      {/* Hidden audio element for browser audio playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default AIVoiceInterview;
