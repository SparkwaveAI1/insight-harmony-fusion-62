import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Zap, Brain, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoicepackToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export const VoicepackToggle: React.FC<VoicepackToggleProps> = ({
  enabled,
  onToggle,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className={`border-2 transition-colors ${enabled ? 'border-primary/30 bg-primary/5' : 'border-muted'} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {enabled ? <Brain className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
            </div>
            <div>
              <CardTitle className="text-base">
                {enabled ? 'Voicepack Engine' : 'Standard Chat'}
                <Badge variant={enabled ? 'default' : 'secondary'} className="ml-2">
                  {enabled ? 'ACTIVE' : 'OFF'}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm">
                {enabled 
                  ? 'Advanced personality-driven responses with linguistic modeling' 
                  : 'Basic persona conversation mode'
                }
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-3 w-3 text-yellow-500" />
              <span>Fast compilation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-3 w-3 text-blue-500" />
              <span>Trait-based language</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs h-7 px-2"
          >
            <Info className="h-3 w-3 mr-1" />
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>

          {showDetails && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs space-y-2">
              <h4 className="font-medium">How Voicepack Works:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Compiles personality traits into linguistic patterns</li>
                <li>• Classifies conversation intent and adapts style</li>
                <li>• Uses signature tokens and anti-mode-collapse</li>
                <li>• Post-processes for consistency and authenticity</li>
              </ul>
              <div className="pt-2 border-t border-muted">
                <div className="flex justify-between text-muted-foreground">
                  <span>Target latency:</span>
                  <span>&lt;3 seconds</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Token budget:</span>
                  <span>350-700 tokens</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};