import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Zap } from 'lucide-react';

interface VoicepackStatusProps {
  personaId: string;
  isCompiled?: boolean;
  lastCompiled?: string;
  onRecompile?: () => void;
}

const VoicepackStatus: React.FC<VoicepackStatusProps> = ({
  personaId,
  isCompiled = false,
  lastCompiled,
  onRecompile
}) => {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5" />
          Voicepack Runtime
          <Badge variant={isCompiled ? "default" : "secondary"}>
            {isCompiled ? "Compiled" : "Not Compiled"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Enhanced conversation engine
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Single-call fast path
          </div>
        </div>
        
        {isCompiled && lastCompiled && (
          <p className="text-sm text-muted-foreground">
            Last compiled: {new Date(lastCompiled).toLocaleString()}
          </p>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRecompile}
            disabled={!onRecompile}
          >
            {isCompiled ? 'Recompile' : 'Compile'} Voicepack
          </Button>
          
          {isCompiled && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`/persona/${personaId}/chat`, '_blank')}
            >
              Test Chat
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Voicepack compilation analyzes personality traits, linguistic style, and cultural context to create a specialized conversation runtime that ensures authentic, differentiated responses.
        </div>
      </CardContent>
    </Card>
  );
};

export default VoicepackStatus;