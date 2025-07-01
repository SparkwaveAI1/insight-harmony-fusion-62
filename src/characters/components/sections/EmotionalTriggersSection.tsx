
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Character } from '../../types/characterTraitTypes';

interface EmotionalTriggersSectionProps {
  character: Character;
  isNonHumanoid: boolean;
}

const EmotionalTriggersSection = ({ character, isNonHumanoid }: EmotionalTriggersSectionProps) => {
  if (!character.emotional_triggers) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isNonHumanoid ? 'Response Triggers' : 'Emotional Triggers'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {character.emotional_triggers.positive_triggers && character.emotional_triggers.positive_triggers.length > 0 && (
          <div>
            <h4 className="font-medium text-green-700 mb-2">
              {isNonHumanoid ? 'Positive Stimuli' : 'Positive Triggers'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {character.emotional_triggers.positive_triggers.map((trigger, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {typeof trigger === 'string' ? trigger : String(trigger)}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {character.emotional_triggers.negative_triggers && character.emotional_triggers.negative_triggers.length > 0 && (
          <div>
            <h4 className="font-medium text-red-700 mb-2">
              {isNonHumanoid ? 'Negative Stimuli' : 'Negative Triggers'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {character.emotional_triggers.negative_triggers.map((trigger, index) => (
                <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                  {typeof trigger === 'string' ? trigger : String(trigger)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionalTriggersSection;
