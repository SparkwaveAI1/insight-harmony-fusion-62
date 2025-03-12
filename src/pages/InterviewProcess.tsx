
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Send, Mic, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const DEFAULT_QUESTIONS = [
  "What's your name and occupation?",
  "What are your main goals when it comes to this product/service?",
  "What are your biggest challenges or pain points related to this area?",
  "How would you describe your ideal solution?",
  "What factors influence your purchasing decisions in this category?",
  "How do you currently solve this problem?",
  "What would make you choose one solution over another?",
];

const InterviewProcess = () => {
  const [step, setStep] = useState<"setup" | "interview" | "summary">("setup");
  const [topic, setTopic] = useState("");
  const [customQuestions, setCustomQuestions] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { toast } = useToast();

  // Parse questions from custom input or use defaults
  const getQuestions = () => {
    if (customQuestions.trim()) {
      return customQuestions.split("\n").filter(q => q.trim());
    }
    return DEFAULT_QUESTIONS;
  };

  const questions = getQuestions();
  
  const startInterview = () => {
    if (!topic.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide an interview topic",
        variant: "destructive"
      });
      return;
    }

    setStep("interview");
    // Add first question to messages
    setMessages([
      {
        id: "1",
        role: "ai",
        content: questions[0]
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
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      
      // Add next AI question after a short delay
      setTimeout(() => {
        const nextAiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: questions[nextQuestion]
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
    You are an expert qualitative researcher analyzing an interview about ${topic}.
    
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
      setStep("summary");
      toast({
        title: "Success",
        description: "AI summary generated successfully",
      });
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      // Fallback to a basic summary if OpenAI fails
      const basicSummary = `Based on your responses about ${topic}, we've identified the following key points:\n\n` +
        `- You've shared ${userResponses.length} responses that help us understand your perspective\n` +
        `- We can now build a persona based on this information\n\n` +
        `Note: This is a basic summary as there was an issue connecting to the AI service. Please check your API key or try again later.`;
      
      setSummary(basicSummary);
      setStep("summary");
      
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
          {/* Setup Step */}
          {step === "setup" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Set Up Your Interview</h1>
                <p className="text-muted-foreground">
                  Customize your AI interviewer to gather the insights you need.
                </p>
              </div>
              
              <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="topic">Interview Topic</Label>
                  <Input 
                    id="topic"
                    placeholder="e.g., Mobile App Usage, Customer Satisfaction, Product Feedback" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    This helps the AI focus the interview on relevant areas.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="questions">
                    Custom Questions (one per line, or leave blank for defaults)
                  </Label>
                  <Textarea 
                    id="questions"
                    placeholder={DEFAULT_QUESTIONS.join("\n")}
                    rows={7}
                    value={customQuestions}
                    onChange={(e) => setCustomQuestions(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API Key (optional for now)</Label>
                  <Input 
                    id="apiKey"
                    type="password"
                    placeholder="sk-..." 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for AI analysis at the end of the interview. You can also add this later.
                  </p>
                </div>
                
                <Button 
                  onClick={startInterview} 
                  className="w-full" 
                  disabled={!topic.trim()}
                >
                  Start Interview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Interview Step */}
          {step === "interview" && (
            <div className="flex flex-col h-[70vh]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{topic} Interview</h2>
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
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
              </div>
              
              {/* Input area */}
              {!interviewComplete && (
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
          )}
          
          {/* Summary Step */}
          {step === "summary" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Interview Summary</h1>
                <p className="text-muted-foreground">
                  Here's what we learned from your responses.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">AI-Generated Insights</h3>
                <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap prose max-w-none dark:prose-invert">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }} />
                  )}
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InterviewProcess;
