
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CharacterTraitProfile, HumanoidCharacterTraitProfile, NonHumanoidTraitProfile } from '../types/characterTraitTypes';

interface CharacterTraitsProps {
  traitProfile: CharacterTraitProfile;
  characterType: 'historical' | 'fictional' | 'multi_species';
}

const CharacterTraits = ({ traitProfile, characterType }: CharacterTraitsProps) => {
  // Handle different character types
  if (characterType === 'multi_species') {
    const nonHumanoidProfile = traitProfile as NonHumanoidTraitProfile;
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Species Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-medium">Species Type:</span>
              <span className="ml-2">{nonHumanoidProfile.species_type}</span>
            </div>
            <div>
              <span className="font-medium">Form Factor:</span>
              <span className="ml-2">{nonHumanoidProfile.form_factor}</span>
            </div>
            <div>
              <span className="font-medium">Communication:</span>
              <span className="ml-2">{nonHumanoidProfile.communication_style.modality}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core Motives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(nonHumanoidProfile.core_motives).map(([motive, value]) => (
              <div key={motive}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{motive.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((value as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((value as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Behavioral Triggers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(nonHumanoidProfile.behavioral_triggers).map(([trigger, sensitivity]) => (
              <div key={trigger}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{trigger.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((sensitivity as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((sensitivity as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core Directives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {nonHumanoidProfile.action_constraints.core_directives.map((directive, index) => (
                <Badge key={index} variant="outline">{directive}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle humanoid characters
  const humanoidProfile = traitProfile as HumanoidCharacterTraitProfile;

  return (
    <div className="space-y-6">
      {/* Physical Appearance */}
      {humanoidProfile.physical_appearance && Object.keys(humanoidProfile.physical_appearance).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Physical Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(humanoidProfile.physical_appearance).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize font-medium">{key.replace(/_/g, ' ')}</span>
                <span>{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Physical Health */}
      {humanoidProfile.physical_health && Object.keys(humanoidProfile.physical_health).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Physical Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(humanoidProfile.physical_health).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize font-medium">{key.replace(/_/g, ' ')}</span>
                <span>{Array.isArray(value) ? value.join(', ') : value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Big Five Personality */}
      {humanoidProfile.big_five && (
        <Card>
          <CardHeader>
            <CardTitle>Big Five Personality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(humanoidProfile.big_five).map(([trait, value]) => (
              <div key={trait}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{trait}</span>
                  <span>{Math.round(((value as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((value as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Moral Foundations */}
      {humanoidProfile.moral_foundations && (
        <Card>
          <CardHeader>
            <CardTitle>Moral Foundations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(humanoidProfile.moral_foundations).map(([foundation, value]) => (
              <div key={foundation}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{foundation.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((value as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((value as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* World Values */}
      {humanoidProfile.world_values && (
        <Card>
          <CardHeader>
            <CardTitle>World Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(humanoidProfile.world_values).map(([value, score]) => (
              <div key={value}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{value.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((score as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((score as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Political Compass */}
      {humanoidProfile.political_compass && (
        <Card>
          <CardHeader>
            <CardTitle>Political Compass</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(humanoidProfile.political_compass).map(([axis, value]) => (
              <div key={axis}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{axis.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((value as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((value as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Behavioral Economics */}
      {humanoidProfile.behavioral_economics && (
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Economics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(humanoidProfile.behavioral_economics).map(([trait, value]) => (
              <div key={trait}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{trait.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((value as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((value as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cultural Dimensions */}
      {humanoidProfile.cultural_dimensions && (
        <Card>
          <CardHeader>
            <CardTitle>Cultural Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(humanoidProfile.cultural_dimensions).map(([dimension, value]) => (
              <div key={dimension}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{dimension.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((value as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((value as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Social Identity */}
      {humanoidProfile.social_identity && (
        <Card>
          <CardHeader>
            <CardTitle>Social Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(humanoidProfile.social_identity).map(([aspect, value]) => (
              <div key={aspect}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{aspect.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((value as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((value as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Extended Traits */}
      {humanoidProfile.extended_traits && (
        <Card>
          <CardHeader>
            <CardTitle>Extended Traits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(humanoidProfile.extended_traits).map(([trait, value]) => (
              <div key={trait}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{trait.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((value as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((value as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dynamic State */}
      {humanoidProfile.dynamic_state && (
        <Card>
          <CardHeader>
            <CardTitle>Dynamic State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(humanoidProfile.dynamic_state).map(([state, value]) => (
              <div key={state}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{state.replace(/_/g, ' ')}</span>
                  <span>{Math.round(((value as number) || 0) * 100)}%</span>
                </div>
                <Progress value={((value as number) || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CharacterTraits;
