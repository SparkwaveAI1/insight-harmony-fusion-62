
import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { generateAIInsights } from "@/services/ai/aiInsightsService";
import { ResearchQuery } from "@/services/types/qualitativeAnalysisTypes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Reveal from "@/components/ui-custom/Reveal";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AvatarChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm the PersonaAI Research Agent. Ask me about market research, sentiment analysis, or any Web3 topic.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    try {
      // Create a research query based on user input
      const query: ResearchQuery = {
        query: input.trim(),
        sources: ["all"],
        sentiment: "all",
        timeFrame: "medium-term",
        keywords: extractKeywords(input.trim()),
      };
      
      // Wait a bit to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate AI response using our existing service
      const insights = generateAIInsights(
        ["Market Sentiment", "Token Utility", "Community Growth"], 
        { positive: 65, negative: 15, neutral: 20 },
        ["defi", "web3", "staking", "rewards", "governance"],
        query
      );
      
      // Format insights into a conversational response
      const responseText = formatInsightsToResponse(insights, query.query);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: responseText,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Sorry, I couldn't process that request. Please try again.");
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again or ask a different question.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction logic
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = new Set(["the", "and", "or", "in", "on", "at", "to", "a", "an", "for", "with", "about", "is", "are", "what", "how", "why", "when", "who", "where"]);
    return words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 5);
  };
  
  const formatInsightsToResponse = (insights: string[], query: string): string => {
    let response = `Based on my analysis of "${query}", I can share these insights:\n\n`;
    
    // Add insights in a more conversational format
    insights.forEach((insight, index) => {
      if (index === 0) {
        response += `${insight}\n\n`;
      } else {
        response += `Additionally, ${insight.charAt(0).toLowerCase()}${insight.slice(1)}\n\n`;
      }
    });
    
    response += "Is there anything specific about this you'd like me to elaborate on?";
    return response;
  };
  
  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        content: "Hello! I'm the PersonaAI Research Agent. Ask me about market research, sentiment analysis, or any Web3 topic.",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
    toast.success("Chat history cleared");
  };

  return (
    <div className="flex flex-col rounded-xl border shadow-lg overflow-hidden bg-background h-[600px] max-w-4xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src="/lovable-uploads/c58004f6-798b-47c0-be8b-701e182b6c62.png" alt="AI Avatar" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">PersonaAI Researcher</p>
            <p className="text-xs text-muted-foreground">Web3 and Market Research Specialist</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearChat}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="sr-only md:not-sr-only md:inline-block">Reset</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <Reveal key={message.id}>
              <div
                className={cn(
                  "flex gap-3 max-w-[80%]",
                  message.sender === "user" ? "ml-auto" : "mr-auto"
                )}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-0.5 border">
                    <AvatarImage src="/lovable-uploads/c58004f6-798b-47c0-be8b-701e182b6c62.png" alt="AI Avatar" />
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 mt-0.5 border">
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            </Reveal>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about market research, sentiment analysis, or any Web3 topic..."
            className="min-h-12 resize-none"
            disabled={isProcessing}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isProcessing}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarChat;
