
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Atom, Calendar } from 'lucide-react';
import { Character } from '../../types/characterTraitTypes';
import { NonHumanoidTraitProfile } from '../../types/nonHumanoidTypes';

interface BasicInformationSectionProps {
  character: Character;
  dateOfBirth: string | undefined;
  isNonHumanoid: boolean;
  isHistorical: boolean;
  nonHumanoidTraitProfile: NonHumanoidTraitProfile | null;
  formatDate: (dateString: string) => string;
  getYearFromDate: (dateString: string) => string | null;
}

const BasicInformationSection = ({
  character,
  dateOfBirth,
  isNonHumanoid,
  isHistorical,
  nonHumanoidTraitProfile,
  formatDate,
  getYearFromDate
}: BasicInformationSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isNonHumanoid ? <Atom className="h-5 w-5" /> : isHistorical ? <Calendar className="h-5 w-5" /> : null}
          {isNonHumanoid ? 'Entity Information' : 'Basic Information'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Character Type:</span>
            <span className="ml-2 capitalize">
              {character.character_type === 'multi_species' ? 'Non-Humanoid Entity' : character.character_type.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="font-medium">Created:</span>
            <span className="ml-2">{formatDate(character.creation_date)}</span>
          </div>
          
          {/* Historical Character Year */}
          {isHistorical && dateOfBirth && (
            <div>
              <span className="font-medium">Year:</span>
              <span className="ml-2">{getYearFromDate(dateOfBirth)}</span>
            </div>
          )}
          
          {/* Non-Humanoid Specific Fields */}
          {isNonHumanoid && (
            <>
              {character.species_type && (
                <div className="col-span-2">
                  <span className="font-medium">Species Type:</span>
                  <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                    {character.species_type}
                  </Badge>
                </div>
              )}
              {character.origin_universe && (
                <div className="col-span-2">
                  <span className="font-medium">Origin Universe:</span>
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                    {character.origin_universe}
                  </Badge>
                </div>
              )}
              {character.form_factor && (
                <div className="col-span-2">
                  <span className="font-medium">Form Factor:</span>
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                    {character.form_factor}
                  </Badge>
                </div>
              )}
            </>
          )}

          {/* Humanoid Specific Fields */}
          {!isNonHumanoid && (
            <>
              {character.age && (
                <div>
                  <span className="font-medium">Age:</span>
                  <span className="ml-2">{character.age}</span>
                </div>
              )}
              {character.gender && (
                <div>
                  <span className="font-medium">Gender:</span>
                  <span className="ml-2">{character.gender}</span>
                </div>
              )}
              {character.historical_period && (
                <div>
                  <span className="font-medium">Historical Period:</span>
                  <span className="ml-2">{character.historical_period}</span>
                </div>
              )}
              {character.region && (
                <div>
                  <span className="font-medium">Region:</span>
                  <span className="ml-2">{character.region}</span>
                </div>
              )}
              {character.social_class && (
                <div>
                  <span className="font-medium">Social Class:</span>
                  <span className="ml-2">{character.social_class}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Behavioral Modulation moved under Basic Information */}
        {character.behavioral_modulation && Object.keys(character.behavioral_modulation).length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">
              {isNonHumanoid ? 'Behavioral Parameters' : 'Behavioral Modulation'}
            </h4>
            <div className="space-y-3">
              {Object.entries(character.behavioral_modulation).map(([trait, value]) => (
                <div key={trait}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{trait.replace(/_/g, ' ')}</span>
                    <span>{Math.round((value as number || 0) * 100)}%</span>
                  </div>
                  <Progress value={(value as number || 0) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicInformationSection;
