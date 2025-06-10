
import { useState, useEffect } from "react";
import { ResearchMessage } from "../hooks/types";

export const useAIAssistant = (messages: ResearchMessage[], assistantActive: boolean) => {
  const [researchInsights, setResearchInsights] = useState<string[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const analyzeConversation = () => {
    if (messages.length < 3) return;

    // Mock insights - in real implementation, this would call an AI service
    const mockInsights = [
      "Participants show strong preference for mobile-first solutions",
      "Cost sensitivity is a recurring theme across responses",
      "User experience concerns mentioned 3 times",
      "Technology adoption patterns vary by demographic"
    ];

    const mockQuestions = [
      "What specific mobile features would be most valuable?",
      "How much would you be willing to pay for this solution?",
      "What would make you trust this technology more?",
      "How do you currently solve this problem?"
    ];

    setResearchInsights(mockInsights.slice(0, Math.min(3, Math.floor(messages.length / 2))));
    setSuggestedQuestions(mockQuestions.slice(0, Math.min(2, Math.floor(messages.length / 3))));
  };

  useEffect(() => {
    if (assistantActive && messages.length > 0) {
      const timer = setTimeout(analyzeConversation, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, assistantActive]);

  return {
    researchInsights,
    suggestedQuestions
  };
};
