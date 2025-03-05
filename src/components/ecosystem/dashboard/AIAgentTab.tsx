
import { useState } from "react";
import { Bot, Zap, MessageSquare } from "lucide-react";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import { Input } from "@/components/ui/input";

const AIAgentTab = () => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: "user" | "assistant"; content: string}[]>([
    {role: "assistant", content: "Hello! I'm your PersonaAI research agent. How can I help with market insights today?"}
  ]);
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    // Add user message to chat
    const newChatHistory = [
      ...chatHistory,
      {role: "user" as const, content: chatMessage}
    ];
    setChatHistory(newChatHistory);
    
    // Mock AI response
    setTimeout(() => {
      setChatHistory([
        ...newChatHistory,
        {role: "assistant" as const, content: "Thank you for your message. Based on current market sentiment analysis, DeFi projects are showing increased user engagement despite market volatility. NFT sentiment trends indicate a shift toward utility-focused collections."}
      ]);
    }, 1000);
    
    setChatMessage("");
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            PersonaAI Research Assistant
          </h3>
          <div className="px-3 py-1 bg-green-900/40 text-green-400 rounded-full text-xs flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            LIVE
          </div>
        </div>
        <p className="text-gray-400 mb-6">
          Chat with our AI agent to get research insights and help with Web3 market analysis.
        </p>
        
        <div className="bg-gray-900 rounded-lg p-4 h-[300px] mb-4 overflow-y-auto flex flex-col space-y-3 border border-gray-700">
          {chatHistory.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user" 
                    ? "bg-primary/80 text-white" 
                    : "bg-gray-800 border border-gray-700"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={sendMessage} className="flex gap-3">
          <Input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Ask about market research, sentiment analysis, or Web3 trends..."
            className="flex-1 bg-gray-800 border-gray-700 text-white"
          />
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-primary to-primary/80 border-none"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </Card>
      
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-xl font-semibold mb-4">AI Video Avatar</h3>
        <p className="text-gray-400 mb-4">
          Talk to our AI research agent through video interaction for a more immersive experience.
        </p>
        <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center border border-gray-700">
          <div className="text-center">
            <Bot className="h-12 w-12 text-primary/50 mx-auto mb-2" />
            <p className="text-sm text-gray-400">AI Video Avatar Coming Soon</p>
            <p className="text-xs text-gray-500 mt-1">Available for Gold Tier stakers</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-700"
        >
          Stake More to Unlock Video Avatar
        </Button>
      </Card>
    </div>
  );
};

export default AIAgentTab;
