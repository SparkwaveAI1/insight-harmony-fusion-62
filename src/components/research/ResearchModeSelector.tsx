
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, BarChart3, Clock } from 'lucide-react';

interface ResearchModeSelectorProps {
  onSelectMode: (mode: 'interview' | 'focus-group' | 'survey') => void;
}

const ResearchModeSelector: React.FC<ResearchModeSelectorProps> = ({ onSelectMode }) => {
  const modes = [
    {
      id: 'interview' as const,
      title: '1-on-1 Interview',
      description: 'Conduct in-depth conversations with individual personas to explore attitudes, motivations, and decision-making processes.',
      icon: MessageSquare,
      features: ['Deep qualitative insights', 'Persona trait exploration', 'Contextual questioning']
    },
    {
      id: 'focus-group' as const,
      title: 'Focus Group',
      description: 'Facilitate group discussions with multiple personas to observe social dynamics and consensus building.',
      icon: Users,
      features: ['Group dynamics', 'Consensus exploration', 'Multiple perspectives']
    },
    {
      id: 'survey' as const,
      title: 'Survey Study',
      description: 'Run structured questionnaires across multiple personas for quantifiable qualitative insights.',
      icon: BarChart3,
      features: ['Structured data collection', 'Scalable insights', 'Comparative analysis']
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Research Interface</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose your research methodology to begin collecting qualitative insights from AI personas.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSurvey = mode.id === 'survey';
          
          return (
            <Card key={mode.id} className={`hover:shadow-lg transition-shadow flex flex-col h-full ${isSurvey ? 'relative' : ''}`}>
              {isSurvey && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 z-10">
                  <Clock className="h-3 w-3 mr-1" />
                  In Development
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl leading-tight">{mode.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex flex-col flex-grow">
                <div className="flex-grow space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {mode.description}
                  </p>
                  
                  {isSurvey && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground text-center">
                        Expected completion: July 2025
                      </p>
                    </div>
                  )}
                  
                  <ul className="space-y-2">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={() => onSelectMode(mode.id)}
                    className="w-full justify-center"
                    variant={isSurvey ? "secondary" : "default"}
                  >
                    {isSurvey ? "Enter Beta" : mode.id === 'interview' ? "Start Interview" : `Start ${mode.title}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ResearchModeSelector;
