
import { useState } from "react";
import { Bot, Zap, MessageSquare } from "lucide-react";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 text-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl border border-amber-200/50">
            <img 
              src="/lovable-uploads/c58004f6-798b-47c0-be8b-701e182b6c62.png" 
              alt="AI Research Avatar" 
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent"></div>
            
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm border border-amber-400/30 rounded-full flex items-center">
              <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-green-400"></span>
              <span className="text-xs font-medium text-amber-300">Live AI Avatar</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                PersonaAI Research Assistant
              </h3>
              <div className="px-3 py-1 bg-green-900/40 text-green-600 rounded-full text-xs flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                LIVE
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Chat with our AI agent to get research insights and help with Web3 market analysis.
            </p>
            
            <div className="bg-white rounded-lg p-4 h-[250px] mb-4 overflow-y-auto flex flex-col space-y-3 border border-amber-200/50 shadow-inner">
              {chatHistory.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/lovable-uploads/c58004f6-798b-47c0-be8b-701e182b6c62.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user" 
                        ? "bg-amber-600 text-white" 
                        : "bg-white border border-amber-200/50 shadow-sm text-gray-700"
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
                className="flex-1 bg-white border-amber-200/50 text-gray-800 placeholder:text-gray-400"
              />
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-amber-600 to-amber-500 border-none"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Premium AI Features</h3>
        <p className="text-gray-400 mb-4">
          Gold Tier stakers unlock additional AI avatar features and research tools.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-medium mb-1">Video Interaction</h4>
            <p className="text-xs text-gray-400 text-center">Immersive video avatar experience</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-medium mb-1">Advanced Analysis</h4>
            <p className="text-xs text-gray-400 text-center">Deep market trend prediction</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-medium mb-1">Custom Reports</h4>
            <p className="text-xs text-gray-400 text-center">Personalized research documents</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-700"
        >
          Stake More to Unlock Premium Features
        </Button>
      </Card>
    </div>
  );
};

export default AIAgentTab;
