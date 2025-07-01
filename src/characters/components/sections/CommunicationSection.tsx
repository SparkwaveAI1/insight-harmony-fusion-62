
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Languages, Zap } from 'lucide-react';
import { Character } from '../../types/characterTraitTypes';

interface CommunicationSectionProps {
  character: Character;
  isNonHumanoid: boolean;
}

const CommunicationSection = ({ character, isNonHumanoid }: CommunicationSectionProps) => {
  if (!character.linguistic_profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          {isNonHumanoid ? 'Universal Translator Interface' : 'Linguistic Profile'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isNonHumanoid ? (
          <>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Active Translation Protocol</span>
              </div>
              <p className="text-blue-700 text-sm">
                This entity communicates through non-human modalities. All interactions are processed through the Universal Translator system.
              </p>
            </div>
            
            {character.linguistic_profile.speech_register && (
              <div>
                <span className="font-medium">Translation Mode:</span>
                <Badge variant="outline" className="ml-2">
                  {character.linguistic_profile.speech_register}
                </Badge>
              </div>
            )}
            
            {character.linguistic_profile.cultural_speech_patterns && (
              <div>
                <span className="font-medium">Communication Method:</span>
                <span className="ml-2 text-muted-foreground">
                  {character.linguistic_profile.cultural_speech_patterns}
                </span>
              </div>
            )}
            
            {character.linguistic_profile.sample_phrasing && character.linguistic_profile.sample_phrasing.length > 0 && (
              <div>
                <span className="font-medium">Translation Notes:</span>
                <div className="mt-2 space-y-1">
                  {character.linguistic_profile.sample_phrasing.map((phrase, index) => (
                    <div key={index} className="text-sm text-muted-foreground italic">
                      "• {phrase}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(character.linguistic_profile, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunicationSection;
