
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MessageSquare, Users, Puzzle, User } from 'lucide-react';

export interface ResearchFormat {
  format_type: 'group_discussion' | 'ab_message_test' | 'scenario_simulation' | 'one_on_one_deep_dive';
  description: string;
  persona_count: string;
  behavior: string;
}

interface SelectResearchFormatProps {
  onFormatSelected: (format: ResearchFormat) => void;
}

const formatOptions = [
  {
    id: 'group_discussion',
    icon: MessageSquare,
    title: 'Group Discussion',
    useCase: 'Product feedback, early exploration',
    behavior: '4–6 personas, round-robin or freeform',
    personaCount: '4-6 personas',
    description: 'Interactive group conversation for broad feedback and exploration'
  },
  {
    id: 'ab_message_test',
    icon: Users,
    title: 'A/B Message Test',
    useCase: 'Compare reactions to two frames or messages',
    behavior: 'Present Option A + B, get reaction split',
    personaCount: '2-4 personas',
    description: 'Side-by-side comparison of different messaging approaches'
  },
  {
    id: 'scenario_simulation',
    icon: Puzzle,
    title: 'Scenario Simulation',
    useCase: 'Test real actions like signup, purchase flows',
    behavior: 'Drop in UX mockup, simulate response',
    personaCount: '2-3 personas',
    description: 'Walk through specific user journeys and workflows'
  },
  {
    id: 'one_on_one_deep_dive',
    icon: User,
    title: '1-on-1 Deep Dive',
    useCase: 'Understand full context from one persona',
    behavior: 'Longform chat with probing follow-ups',
    personaCount: '1 persona',
    description: 'In-depth exploration with detailed follow-up questions'
  }
];

export const SelectResearchFormat: React.FC<SelectResearchFormatProps> = ({ onFormatSelected }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  const handleContinue = () => {
    const selected = formatOptions.find(opt => opt.id === selectedFormat);
    if (selected) {
      const format: ResearchFormat = {
        format_type: selected.id as ResearchFormat['format_type'],
        description: selected.description,
        persona_count: selected.personaCount,
        behavior: selected.behavior
      };
      onFormatSelected(format);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Select Research Format</h2>
        <p className="text-muted-foreground">
          Choose the format that best matches your research goals
        </p>
      </div>

      <Card className="p-6">
        <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
          <div className="grid gap-4">
            {formatOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-3">
                <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  <Card className={`p-4 transition-colors ${
                    selectedFormat === option.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <option.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{option.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {option.personaCount}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Use Case:</strong> {option.useCase}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>System Behavior:</strong> {option.behavior}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="mt-6">
          <Button 
            onClick={handleContinue}
            disabled={!selectedFormat}
            className="w-full"
          >
            Continue with Selected Format
          </Button>
        </div>
      </Card>
    </div>
  );
};
