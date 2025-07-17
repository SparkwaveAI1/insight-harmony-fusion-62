
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Character } from '../../types/characterTraitTypes';

interface CommunicationSectionProps {
  character: Character;
  isNonHumanoid: boolean;
}

const CommunicationSection = ({ character, isNonHumanoid }: CommunicationSectionProps) => {
  const linguisticProfile = character.linguistic_profile;
  
  if (!linguisticProfile || Object.keys(linguisticProfile).length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isNonHumanoid ? 'Signal Transmission' : 'Communication Style'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {linguisticProfile.default_output_length && (
          <div>
            <span className="font-medium">
              {isNonHumanoid ? 'Signal Length:' : 'Default Output Length:'}
            </span>
            <Badge variant="secondary" className="ml-2">
              {linguisticProfile.default_output_length}
            </Badge>
          </div>
        )}
        {linguisticProfile.speech_register && (
          <div>
            <span className="font-medium">
              {isNonHumanoid ? 'Transmission Register:' : 'Speech Register:'}
            </span>
            <Badge variant="secondary" className="ml-2">
              {linguisticProfile.speech_register}
            </Badge>
          </div>
        )}
        {linguisticProfile.cultural_speech_patterns && (
          <div>
            <span className="font-medium">
              {isNonHumanoid ? 'Signal Patterns:' : 'Cultural Speech Patterns:'}
            </span>
            <Badge variant="secondary" className="ml-2">
              {linguisticProfile.cultural_speech_patterns}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunicationSection;
