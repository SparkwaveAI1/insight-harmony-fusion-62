
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Send, Mic, User } from "lucide-react";
import { Link } from "react-router-dom";

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

  // Parse questions from custom input or use defaults
  const getQuestions = () => {
    if (customQuestions.trim()) {
      return customQuestions.split("\n").filter(q => q.trim());
    }
    return DEFAULT_QUESTIONS;
  };

  const questions = getQuestions();
  
  const startInterview = () => {
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

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const newMessages = [
      ...messages,
      {
        id: Date.now().toString(),
        role: "user",
        content: userInput
      }
    ];
    
    setMessages(newMessages);
    setUserInput("");
    
    // Move to next question or finish interview
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      
      // Add next AI question after a short delay
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: questions[nextQuestion]
          }
        ]);
      }, 500);
    } else {
      // Interview is complete
      setInterviewComplete(true);
      
      // Generate a summary (in a real application, this would be done by an AI)
      setTimeout(() => {
        const userResponses = newMessages.filter(m => m.role === "user").map(m => m.content);
        const mockSummary = `Based on your responses, we've identified the following key points:\n\n` +
          `- You appear to be interested in ${topic}\n` +
          `- You've shared ${userResponses.length} responses that help us understand your perspective\n` +
          `- We can now build a persona based on this information`;
          
        setSummary(mockSummary);
        setStep("summary");
      }, 1500);
    }
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
                
                {interviewComplete && (
                  <div className="text-center p-4 text-muted-foreground">
                    <p>Interview complete. Generating summary...</p>
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
                  <Button onClick={handleSendMessage} disabled={!userInput.trim()}>
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
                <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">
                  {summary}
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
