
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
                {/* Ensure value is not null or undefined before using it */}
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
                {/* Ensure sensitivity is not null or undefined before using it */}
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

  // Handle humanoid characters with descriptive content instead of detailed traits
  const humanoidProfile = traitProfile as HumanoidCharacterTraitProfile;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
        Character Psychological Profile
      </h2>
      
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {characterType === 'historical' ? 'Historically Accurate Personality' : 'Rich Character Development'}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {characterType === 'historical' 
                ? `This historical character has been carefully researched and modeled to reflect authentic 
                   personality traits, cultural context, and behavioral patterns from their era. Our advanced 
                   psychological modeling captures the complexity of how they would have thought, felt, and 
                   interacted based on historical evidence and period-appropriate worldviews.`
                : `This fictional character has been developed with deep psychological complexity using 
                   comprehensive personality modeling. Every aspect of their behavior, decision-making, 
                   and emotional responses has been carefully crafted to create an authentic and 
                   engaging character that feels real and relatable.`
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">
                {characterType === 'historical' ? '📚 Historical Context' : '🎭 Character Depth'}
              </h4>
              <p className="text-sm text-gray-600">
                {characterType === 'historical'
                  ? `Grounded in extensive historical research, reflecting the social norms, 
                     cultural values, and life experiences typical of their time period and circumstances.`
                  : `Developed with multi-dimensional personality traits that create consistent, 
                     believable responses across different scenarios and interactions.`
                }
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">🧠 Cognitive Patterns</h4>
              <p className="text-sm text-gray-600">
                {characterType === 'historical'
                  ? `Thinking patterns and decision-making processes informed by the knowledge, 
                     beliefs, and cognitive frameworks available during their historical period.`
                  : `Unique thought processes, problem-solving approaches, and mental models that 
                     define how this character perceives and interacts with their world.`
                }
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">💭 Emotional Landscape</h4>
              <p className="text-sm text-gray-600">
                {characterType === 'historical'
                  ? `Emotional responses and interpersonal dynamics shaped by historical social 
                     structures, family dynamics, and the challenges of their era.`
                  : `Complex emotional intelligence with authentic reactions, relationship patterns, 
                     and emotional growth that makes interactions feel genuine and meaningful.`
                }
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">
                {characterType === 'historical' ? '⚖️ Period Values' : '🎯 Value System'}
              </h4>
              <p className="text-sm text-gray-600">
                {characterType === 'historical'
                  ? `Moral foundations and ethical frameworks consistent with their historical 
                     context, social class, and cultural background.`
                  : `Core beliefs, moral principles, and value systems that guide their choices 
                     and create consistent character motivations.`
                }
              </p>
            </div>
          </div>
          
          <div className="text-center mt-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
            <p className="text-sm text-gray-700 font-medium">
              ✨ This comprehensive character modeling enables authentic, engaging conversations that 
              capture the {characterType === 'historical' ? 'historical authenticity' : 'creative depth'} and 
              personality nuances that make each interaction unique and memorable.
            </p>
          </div>
        </div>
      </div>
      
      {/* Technical summary for reference */}
      <details className="mt-4 p-2 bg-gray-50 rounded text-xs">
        <summary className="cursor-pointer font-mono text-gray-500">Technical: Character Analysis</summary>
        <div className="mt-2 text-gray-600">
          <p>Character model includes comprehensive psychological profiling across validated personality frameworks</p>
        </div>
      </details>
    </div>
  );
};

export default CharacterTraits;
