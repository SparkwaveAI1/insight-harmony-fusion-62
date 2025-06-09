
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send } from 'lucide-react';
import { StudyGoal } from './DefineStudyGoals';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface StudyGoalsAssistantProps {
  onGoalGenerated: (goal: StudyGoal) => void;
}

export const StudyGoalsAssistant: React.FC<StudyGoalsAssistantProps> = ({ onGoalGenerated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Let's figure out your research goal. What kind of problem or question are you exploring?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Simulate AI response based on conversation flow
    setTimeout(() => {
      const newMessage = generateAssistantResponse(userMessage, messages.length);
      setMessages(prev => [...prev, { role: 'assistant', content: newMessage }]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAssistantResponse = (userMessage: string, messageCount: number): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (messageCount === 1) {
      // First response - clarify what they want to test
      if (lowerMessage.includes('token') || lowerMessage.includes('incentive')) {
        return "Got it. Are you hoping to test how users make decisions about tokens/incentives, or do you want emotional feedback about the concept itself?";
      } else if (lowerMessage.includes('signup') || lowerMessage.includes('onboarding')) {
        return "Interesting! Are you looking to understand where users get stuck in the flow, or what motivates them to complete vs. abandon it?";
      } else if (lowerMessage.includes('churn') || lowerMessage.includes('leaving')) {
        return "That's valuable research. Do you want to understand the emotional reasons people leave, or test different retention strategies?";
      } else {
        return "Got it. Are you hoping to test how users make decisions, or get emotional feedback about your concept?";
      }
    } else if (messageCount === 3) {
      // Second response - get more specific
      return "Perfect! One more question: Are you looking for direct quotes from users, or do you want to test specific scenarios and see how they react?";
    } else {
      // Final response - generate structured goal
      generateStructuredGoal(userMessage);
      return "Great! I've structured your research goal. Let me show you what we came up with.";
    }
  };

  const generateStructuredGoal = (lastMessage: string) => {
    // Extract key information from all messages to create a structured goal
    const allUserMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
    const fullContext = allUserMessages + ' ' + lastMessage;
    
    let goalType: StudyGoal['goal_type'] = 'product_feedback';
    let tags: string[] = [];
    let objective = '';

    // Simple keyword-based logic (in real app, this would be AI-powered)
    if (fullContext.toLowerCase().includes('token') || fullContext.toLowerCase().includes('incentive')) {
      goalType = 'incentive_modeling';
      tags = ['tokens', 'incentives', 'motivation'];
      objective = 'Understand what kind of staking incentives would attract low-trust users';
    } else if (fullContext.toLowerCase().includes('signup') || fullContext.toLowerCase().includes('onboarding')) {
      goalType = 'feature_validation';
      tags = ['onboarding', 'user_experience', 'conversion'];
      objective = 'Identify barriers preventing users from completing the onboarding flow';
    } else if (fullContext.toLowerCase().includes('churn') || fullContext.toLowerCase().includes('leaving')) {
      goalType = 'churn_diagnosis';
      tags = ['retention', 'churn', 'user_behavior'];
      objective = 'Understand the primary reasons users are leaving the platform';
    } else {
      objective = 'Get user feedback on product concepts and user experience';
      tags = ['feedback', 'user_research'];
    }

    const goal: StudyGoal = {
      objective,
      goal_type: goalType,
      tags,
      output_targets: ['quote_extraction', 'barrier_detection', 'sentiment_analysis']
    };

    // Delay to show the final message first
    setTimeout(() => {
      onGoalGenerated(goal);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-96">
      <ScrollArea className="flex-1 p-4 border rounded-lg">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="flex gap-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your response..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
