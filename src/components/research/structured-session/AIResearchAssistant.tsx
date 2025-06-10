
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Lightbulb, Target, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";
import { ResearchMessage } from "../hooks/types";

interface AIResearchAssistantProps {
  researchInsights: string[];
  suggestedQuestions: string[];
  messages: ResearchMessage[];
  onSendMessage: (message: string) => Promise<void>;
  loadedPersonasCount: number;
}

export const AIResearchAssistant = ({
  researchInsights,
  suggestedQuestions,
  messages,
  onSendMessage,
  loadedPersonasCount
}: AIResearchAssistantProps) => {
  const handleQuestionClick = async (question: string) => {
    await onSendMessage(question);
    toast.success("Question sent to participants");
  };

  return (
    <div className="w-80 border-l bg-muted/30">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Research Assistant</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered insights and guidance for your study
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Real-time Insights */}
        {researchInsights.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="font-medium text-sm">Key Insights</h3>
            </div>
            <div className="space-y-2">
              {researchInsights.map((insight, index) => (
                <div key={index} className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                  {insight}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-blue-500" />
              <h3 className="font-medium text-sm">Suggested Questions</h3>
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-2 text-xs"
                  onClick={() => handleQuestionClick(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Research Best Practices */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-green-500" />
            <h3 className="font-medium text-sm">Best Practices</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>• Ask open-ended questions to encourage detailed responses</div>
            <div>• Follow up on interesting insights with deeper questions</div>
            <div>• Look for patterns across different persona responses</div>
            <div>• Document key quotes and reactions for your report</div>
          </div>
        </Card>

        {/* Session Stats */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-purple-500" />
            <h3 className="font-medium text-sm">Session Stats</h3>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Messages:</span>
              <span>{messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Participants:</span>
              <span>{loadedPersonasCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Insights:</span>
              <span>{researchInsights.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
