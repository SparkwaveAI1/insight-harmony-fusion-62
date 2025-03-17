
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mic, Play, SkipForward, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Reveal from "@/components/ui-custom/Reveal";
import ApiKeyManager from "@/components/ApiKeyManager";
import { useInterviewSession, InterviewState, Message } from "@/hooks/useInterviewSession";
import { generateResponse } from "@/services/ai/openaiService";
import { getApiKey } from "@/services/utils/apiKeyUtils";

// Standard predefined interview questions
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
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get participant data from location state
  useEffect(() => {
    if (location.state?.participantData) {
      setParticipantData(location.state.participantData);
    }
  }, [location]);

  // Check for API key
  useEffect(() => {
    const storedApiKey = getApiKey('openai');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  // Interview session hook
  const {
    interviewState,
    messages,
    currentQuestion,
    elapsedTime,
    canSkip,
    isCompleted,
    startInterview,
    skipQuestion,
    replayQuestion,
    stopInterview
  } = useInterviewSession({
    participantId: participantData?.id,
    initialQuestions: STANDARD_QUESTIONS,
    onComplete: handleInterviewComplete
  });

  // Start the interview when component mounts and API key is available
  useEffect(() => {
    if (apiKey && interviewState === InterviewState.IDLE && !showApiKeyInput) {
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

    // Format the conversation for OpenAI
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
      // Fallback to a basic summary if OpenAI fails
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

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "API Key Added",
      description: "Your API key has been set. Starting interview now."
    });

    setShowApiKeyInput(false);
    startInterview();
  };

  const handleApiKeyUpdate = (newApiKey: string | null) => {
    if (newApiKey) {
      setApiKey(newApiKey);
      setShowApiKeyInput(false);
      startInterview();
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

  // Current question text
  const currentQuestionText = messages.length > 0 
    ? messages[messages.length - 1]?.role === 'ai' 
      ? messages[messages.length - 1]?.content 
      : "" 
    : "";

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
              {/* Avatar and Question */}
              <div className="flex flex-col items-center max-w-xl w-full mb-12">
                {/* AI Avatar */}
                <div className="relative mb-10">
                  <Avatar className={`w-64 h-64 rounded-full ${interviewState === InterviewState.SPEAKING ? 'animate-pulse' : ''}`}>
                    <AvatarImage
                      src="/lovable-uploads/0082cb4d-cc17-46da-8c05-508924cdc668.png"
                      alt="AI Avatar"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-4xl">AI</AvatarFallback>
                  </Avatar>
                  
                  {/* Glowing outline when speaking */}
                  <div className={`absolute inset-0 rounded-full ring-4 ring-primary shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-opacity duration-500 ${
                    interviewState === InterviewState.SPEAKING ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                </div>
                
                {/* Current Question */}
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
              </div>
              
              {/* Bottom Controls */}
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
