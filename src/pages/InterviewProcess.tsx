
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Send, Mic, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { toast } = useToast();

  // Start the interview automatically when component mounts
  useEffect(() => {
    startInterview();
  }, []);

  const startInterview = () => {
    // Add first question to messages
    setMessages([
      {
        id: "1",
        role: "ai",
        content: STANDARD_QUESTIONS[0]
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput("");
    
    // Move to next question or finish interview
    if (currentQuestion < STANDARD_QUESTIONS.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      
      // Add next AI question after a short delay
      setTimeout(() => {
        const nextAiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: STANDARD_QUESTIONS[nextQuestion]
        };
        setMessages(prevMessages => [...prevMessages, nextAiMessage]);
      }, 500);
    } else {
      // Interview is complete
      setInterviewComplete(true);
      setIsLoading(true);
      
      try {
        // Generate a summary using OpenAI
        await generateAiSummary(updatedMessages);
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
  };

  const generateAiSummary = async (interviewMessages: Message[]) => {
    if (!apiKey && !showApiKeyInput) {
      setShowApiKeyInput(true);
      setIsLoading(false);
      return;
    }

    if (!apiKey && showApiKeyInput) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to generate a summary",
        variant: "destructive"
      });
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
          model: "gpt-4-turbo-preview",
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
      description: "Your API key has been set. Generating summary now."
    });

    setIsLoading(true);
    generateAiSummary(messages);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Interview Interface */}
          <div className="flex flex-col h-[70vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI Interview Session</h2>
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {STANDARD_QUESTIONS.length}
              </div>
            </div>
            
            {/* Messages Container */}
            <div className="flex-grow overflow-y-auto bg-muted/30 rounded-lg p-4 mb-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[80%] p-3 rounded-lg 
                    ${message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-12' 
                      : 'bg-card text-card-foreground mr-12 border'}
                  `}>
                    {message.role === 'ai' && (
                      <div className="flex items-center gap-2 mb-1 text-sm font-medium text-muted-foreground">
                        <Mic className="h-4 w-4" />
                        AI Interviewer
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="flex items-center justify-end gap-2 mb-1 text-sm font-medium text-primary-foreground/80">
                        You
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {interviewComplete && !showApiKeyInput && (
                <div className="text-center p-4 text-muted-foreground">
                  <p>Interview complete. Generating summary...</p>
                </div>
              )}

              {showApiKeyInput && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">OpenAI API Key Required</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    To generate an AI-powered summary of this interview, please enter your OpenAI API key:
                  </p>
                  <div className="space-y-4">
                    <Input 
                      type="password"
                      placeholder="sk-..." 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button 
                      onClick={handleApiKeySubmit}
                      className="w-full"
                      disabled={!apiKey.trim()}
                    >
                      Generate AI Summary
                    </Button>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {summary && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Interview Summary</h3>
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
              )}
            </div>
            
            {/* Input area */}
            {!interviewComplete && !summary && (
              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your response..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!userInput.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InterviewProcess;
