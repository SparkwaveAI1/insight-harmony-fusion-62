
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Atom, Globe, Zap, Brain, Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidTraitProfile } from '../types/nonHumanoidTypes';
import CharacterTraits from './CharacterTraits';

interface CharacterInfoSectionsProps {
  character: Character;
}

const CharacterInfoSections = ({ character }: CharacterInfoSectionsProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    physicalManifestation: false,
    communication: false,
    linguisticProfile: false,
    entityProfile: false,
    metadata: false,
    behavioralModulation: false,
    emotionalSystem: false,
    characterTraits: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const isNonHumanoid = character.character_type === 'multi_species';
  const nonHumanoidTraitProfile = isNonHumanoid ? character.trait_profile as NonHumanoidTraitProfile : null;

  const CollapsibleCard = ({ 
    sectionKey, 
    title, 
    icon: Icon, 
    children 
  }: { 
    sectionKey: string; 
    title: string; 
    icon?: React.ComponentType<{ className?: string }>; 
    children: React.ReactNode; 
  }) => (
    <Card>
      <Collapsible 
        open={openSections[sectionKey]} 
        onOpenChange={() => toggleSection(sectionKey)}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5" />}
                {title}
              </div>
              <Button variant="ghost" size="sm">
                {openSections[sectionKey] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Basic Information for Non-Humanoid Characters */}
      <CollapsibleCard
        sectionKey="basicInfo"
        title={isNonHumanoid ? 'Entity Information' : 'Basic Information'}
        icon={isNonHumanoid ? Atom : undefined}
      >
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
      </CollapsibleCard>

      {/* Physical Manifestation Section for Non-Humanoid Characters */}
      {isNonHumanoid && nonHumanoidTraitProfile?.physical_manifestation && (
        <CollapsibleCard
          sectionKey="physicalManifestation"
          title="Physical Manifestation"
          icon={Atom}
        >
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
        </CollapsibleCard>
      )}

      {/* Enhanced Communication Section for Non-Humanoid Characters */}
      {isNonHumanoid && character.linguistic_profile && (
        <CollapsibleCard
          sectionKey="communication"
          title="Universal Translator Interface"
          icon={Languages}
        >
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
        </CollapsibleCard>
      )}

      {/* Regular Linguistic Profile for Humanoid Characters */}
      {!isNonHumanoid && character.linguistic_profile && Object.keys(character.linguistic_profile).length > 0 && (
        <CollapsibleCard
          sectionKey="linguisticProfile"
          title="Linguistic Profile"
        >
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(character.linguistic_profile, null, 2)}
          </pre>
        </CollapsibleCard>
      )}

      {/* Enhanced Metadata for Non-Humanoid Characters */}
      {isNonHumanoid && character.metadata && Object.keys(character.metadata).length > 0 && (
        <CollapsibleCard
          sectionKey="entityProfile"
          title="Entity Profile"
          icon={Brain}
        >
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
        </CollapsibleCard>
      )}

      {/* Behavioral Modulation */}
      {character.behavioral_modulation && Object.keys(character.behavioral_modulation).length > 0 && (
        <CollapsibleCard
          sectionKey="behavioralModulation"
          title={isNonHumanoid ? 'Behavioral Parameters' : 'Behavioral Modulation'}
        >
          {Object.entries(character.behavioral_modulation).map(([trait, value]) => (
            <div key={trait}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{trait.replace(/_/g, ' ')}</span>
                <span>{Math.round((value as number || 0) * 100)}%</span>
              </div>
              <Progress value={(value as number || 0) * 100} className="h-2" />
            </div>
          ))}
        </CollapsibleCard>
      )}

      {/* Emotional System (character-specific) */}
      {character.emotional_system && (
        <CollapsibleCard
          sectionKey="emotionalSystem"
          title={isNonHumanoid ? 'Response System' : 'Emotional System'}
        >
          {character.emotional_system.core_drives && character.emotional_system.core_drives.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-700 mb-2">
                {isNonHumanoid ? 'Core Drives' : 'Core Drives'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {character.emotional_system.core_drives.map((drive, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {typeof drive === 'string' ? drive : String(drive)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {character.emotional_system.surface_triggers && character.emotional_system.surface_triggers.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-700 mb-2">
                {isNonHumanoid ? 'Surface Triggers' : 'Surface Triggers'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {character.emotional_system.surface_triggers.map((trigger, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                    {typeof trigger === 'string' ? trigger : String(trigger)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {character.emotional_system.emotional_responses?.change_response_style && (
            <div>
              <h4 className="font-medium text-green-700 mb-2">Change Response Style</h4>
              <p className="text-sm text-muted-foreground">
                {character.emotional_system.emotional_responses.change_response_style}
              </p>
            </div>
          )}
        </CollapsibleCard>
      )}

      {/* Character Traits */}
      <CollapsibleCard
        sectionKey="characterTraits"
        title="Character Traits"
      >
        <CharacterTraits 
          traitProfile={character.trait_profile} 
          characterType={character.character_type}
        />
      </CollapsibleCard>
    </div>
  );
};

export default CharacterInfoSections;
