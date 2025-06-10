
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FlaskConical, ArrowLeft, Bot, Database } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionHeaderProps {
  projectId: string | null;
  loadedPersonasCount: number;
  knowledgeBaseActive: boolean;
  assistantActive: boolean;
  onToggleKnowledgeBase: () => void;
  onToggleAssistant: () => void;
}

export const SessionHeader = ({
  projectId,
  loadedPersonasCount,
  knowledgeBaseActive,
  assistantActive,
  onToggleKnowledgeBase,
  onToggleAssistant
}: SessionHeaderProps) => {
  return (
    <div className="border-b p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/research/setup/structured">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Setup
            </Button>
          </Link>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Structured Study Session</h1>
          </div>
          
          {projectId && (
            <Badge variant="outline">Project Session</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {loadedPersonasCount} Persona{loadedPersonasCount !== 1 ? 's' : ''}
          </Badge>
          
          <Button
            variant={knowledgeBaseActive ? "default" : "outline"}
            size="sm"
            onClick={onToggleKnowledgeBase}
            className="gap-2"
          >
            <Database className="h-4 w-4" />
            Knowledge Base
          </Button>
          
          <Button
            variant={assistantActive ? "default" : "outline"}
            size="sm"
            onClick={onToggleAssistant}
            className="gap-2"
          >
            <Bot className="h-4 w-4" />
            AI Assistant
          </Button>
        </div>
      </div>
    </div>
  );
};
