
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Atom, Calendar, MapPin, Clock } from 'lucide-react';
import { Character } from '../../types/characterTraitTypes';

interface BasicInformationSectionProps {
  character: Character;
  dateOfBirth: string | undefined;
  isNonHumanoid: boolean;
  isHistorical: boolean;
  nonHumanoidTraitProfile: any;
  formatDate: (dateString: string) => string;
  getYearFromDate: (dateString: string) => string;
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
  // Helper function to get the correct historical year
  const getHistoricalYear = () => {
    // For historical characters, try to extract year from various sources
    if (isHistorical) {
      // First try metadata date_of_birth
      if (character.metadata?.date_of_birth) {
        const year = parseInt(character.metadata.date_of_birth.toString().split('-')[0]);
        if (year && year > 0 && year < 2100) {
          return year.toString();
        }
      }
      
      // Try to extract year from historical_period
      if (character.historical_period) {
        const yearMatch = character.historical_period.match(/(\d{4})/);
        if (yearMatch) {
          return yearMatch[1];
        }
      }
      
      // Try metadata historical_period
      if (character.metadata?.historical_period) {
        const yearMatch = character.metadata.historical_period.match(/(\d{4})/);
        if (yearMatch) {
          return yearMatch[1];
        }
      }
      
      // Calculate from age and current date (approximation)
      if (character.age && character.historical_period) {
        // This is a rough approximation - could be improved with more context
        const currentYear = new Date().getFullYear();
        const approximateYear = currentYear - parseInt(character.age.toString());
        return approximateYear.toString();
      }
    }
    
    // Fallback to creation date year for non-historical characters
    return getYearFromDate(character.creation_date);
  };

  // Helper function to get location information
  const getHistoricalLocation = () => {
    // Try various sources for location
    if (character.metadata?.region) {
      return character.metadata.region;
    }
    if (character.region) {
      return character.region;
    }
    if (character.metadata?.location) {
      return character.metadata.location;
    }
    return null;
  };

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
          
          {/* Historical Character Year and Location - Prominent display */}
          {isHistorical && (
            <>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Historical Year:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getHistoricalYear()}
                </Badge>
              </div>
              {getHistoricalLocation() && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Location:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {getHistoricalLocation()}
                  </Badge>
                </div>
              )}
            </>
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
              {character.region && !isHistorical && (
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
