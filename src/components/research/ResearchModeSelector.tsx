
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, BarChart3, Clock } from 'lucide-react';

interface ResearchModeSelectorProps {
  onSelectMode: (mode: 'interview' | 'survey') => void;
}

const ResearchModeSelector: React.FC<ResearchModeSelectorProps> = ({ onSelectMode }) => {
  const modes = [
    {
      id: 'survey' as const,
      title: 'Insights Engine',
      description: 'Launch our advanced AI engine to generate deep insights across multiple personas with structured analysis.',
      icon: BarChart3,
      features: ['AI-powered insights', 'Multi-persona analysis', 'Structured intelligence']
    },
    {
      id: 'interview' as const,
      title: '1-on-1 Interview',
      description: 'Conduct in-depth conversations with individual personas to explore attitudes, motivations, and decision-making processes.',
      icon: MessageSquare,
      features: ['Deep qualitative insights', 'Persona trait exploration', 'Contextual questioning']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Research Interface</h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              PersonaAI lets you conduct qualitative research using advanced AI personas—delivering deep insights at scale through multiple research methodologies.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSurvey = mode.id === 'survey';
          const isInDevelopment = isSurvey;
          
          return (
            <Card key={mode.id} className={`hover:shadow-lg transition-shadow flex flex-col h-full ${isInDevelopment ? 'relative' : ''}`}>
              {isInDevelopment && (
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
                    variant="default"
                  >
                    {isSurvey ? "Launch Insights Engine" : "Start Interview"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
         })}
        </div>
      </div>
    </div>
  );
};

export default ResearchModeSelector;
