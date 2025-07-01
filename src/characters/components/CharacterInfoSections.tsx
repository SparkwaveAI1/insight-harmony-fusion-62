
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Atom, Globe, Zap, Brain, Languages, BookOpen, Calendar } from 'lucide-react';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidTraitProfile } from '../types/nonHumanoidTypes';
import CharacterTraits from './CharacterTraits';

interface CharacterInfoSectionsProps {
  character: Character;
}

const CharacterInfoSections = ({ character }: CharacterInfoSectionsProps) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Extract year from date of birth for historical characters
  const getYearFromDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch {
      // Try to extract year from string format like "1790-01-01"
      const yearMatch = dateString.match(/(\d{4})/);
      return yearMatch ? yearMatch[1] : null;
    }
  };

  const isNonHumanoid = character.character_type === 'multi_species';
  const isHistorical = character.character_type === 'historical';
  // Type cast when we know it's a non-humanoid character
  const nonHumanoidTraitProfile = isNonHumanoid ? character.trait_profile as NonHumanoidTraitProfile : null;

  // Access date_of_birth and backstory from metadata
  const dateOfBirth = character.metadata?.date_of_birth;
  const backstory = character.metadata?.backstory || character.trait_profile?.backstory;

  return (
    <div className="space-y-6">
      {/* Enhanced Basic Information */}
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

      {/* Background Section (replaces Emotional Triggers for historical characters) */}
      {isHistorical && backstory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Background
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {backstory}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Physical Manifestation Section for Non-Humanoid Characters */}
      {isNonHumanoid && nonHumanoidTraitProfile?.physical_manifestation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Atom className="h-5 w-5" />
              Physical Manifestation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-400">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nonHumanoidTraitProfile.physical_manifestation.primary_form && (
                  <div>
                    <span className="font-medium text-purple-800">Primary Form:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.primary_form}
                    </p>
                  </div>
                )}
                {nonHumanoidTraitProfile.physical_manifestation.scale_category && (
                  <div>
                    <span className="font-medium text-purple-800">Scale:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.scale_category}
                    </p>
                  </div>
                )}
                {nonHumanoidTraitProfile.physical_manifestation.material_composition && (
                  <div>
                    <span className="font-medium text-purple-800">Material:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.material_composition}
                    </p>
                  </div>
                )}
                {nonHumanoidTraitProfile.physical_manifestation.dimensional_properties && (
                  <div>
                    <span className="font-medium text-purple-800">Dimensions:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.dimensional_properties}
                    </p>
                  </div>
                )}
                {nonHumanoidTraitProfile.physical_manifestation.luminescence_pattern && (
                  <div>
                    <span className="font-medium text-purple-800">Luminescence:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.luminescence_pattern}
                    </p>
                  </div>
                )}
                {nonHumanoidTraitProfile.physical_manifestation.texture_quality && (
                  <div>
                    <span className="font-medium text-purple-800">Texture:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.texture_quality}
                    </p>
                  </div>
                )}
                {nonHumanoidTraitProfile.physical_manifestation.movement_characteristics && (
                  <div>
                    <span className="font-medium text-purple-800">Movement:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.movement_characteristics}
                    </p>
                  </div>
                )}
                {nonHumanoidTraitProfile.physical_manifestation.environmental_interaction && (
                  <div>
                    <span className="font-medium text-purple-800">Environmental Effect:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.environmental_interaction}
                    </p>
                  </div>
                )}
                {nonHumanoidTraitProfile.physical_manifestation.sensory_emanations && (
                  <div>
                    <span className="font-medium text-purple-800">Sensory Output:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.sensory_emanations}
                    </p>
                  </div>
                )}
                {nonHumanoidTraitProfile.physical_manifestation.structural_complexity && (
                  <div>
                    <span className="font-medium text-purple-800">Structure:</span>
                    <p className="text-purple-700 text-sm mt-1">
                      {nonHumanoidTraitProfile.physical_manifestation.structural_complexity}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Communication Section for Non-Humanoid Characters */}
      {isNonHumanoid && character.linguistic_profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Universal Translator Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      )}

      {/* Regular Linguistic Profile for Humanoid Characters */}
      {!isNonHumanoid && character.linguistic_profile && Object.keys(character.linguistic_profile).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linguistic Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(character.linguistic_profile, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Metadata for Non-Humanoid Characters */}
      {isNonHumanoid && character.metadata && Object.keys(character.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Entity Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {character.metadata.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-muted-foreground">{character.metadata.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {character.metadata.narrative_domain && (
                <div>
                  <span className="font-medium">Domain:</span>
                  <Badge variant="outline" className="ml-2">{character.metadata.narrative_domain}</Badge>
                </div>
              )}
              {character.metadata.functional_role && (
                <div>
                  <span className="font-medium">Role:</span>
                  <Badge variant="outline" className="ml-2">{character.metadata.functional_role}</Badge>
                </div>
              )}
              {character.metadata.environment && (
                <div>
                  <span className="font-medium">Environment:</span>
                  <span className="ml-2 text-sm">{character.metadata.environment}</span>
                </div>
              )}
              {character.metadata.communication && (
                <div>
                  <span className="font-medium">Native Communication:</span>
                  <span className="ml-2 text-sm">{character.metadata.communication}</span>
                </div>
              )}
            </div>

            {character.metadata.core_drives && character.metadata.core_drives.length > 0 && (
              <div>
                <span className="font-medium">Core Drives:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {character.metadata.core_drives.map((drive: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {drive}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {character.metadata.surface_triggers && character.metadata.surface_triggers.length > 0 && (
              <div>
                <span className="font-medium">Behavioral Triggers:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {character.metadata.surface_triggers.map((trigger: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emotional Triggers - Only for Non-Historical Characters */}
      {!isHistorical && character.emotional_triggers && (
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
      )}

      {/* Character Traits */}
      <CharacterTraits 
        traitProfile={character.trait_profile} 
        characterType={character.character_type}
      />
    </div>
  );
};

export default CharacterInfoSections;
