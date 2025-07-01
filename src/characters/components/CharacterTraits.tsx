
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CharacterTraitProfile } from '../types/characterTraitTypes';

interface CharacterTraitsProps {
  traitProfile: CharacterTraitProfile;
  characterType: 'historical' | 'fictional' | 'multi_species';
}

const CharacterTraits = ({ traitProfile, characterType }: CharacterTraitsProps) => {
  console.log('CharacterTraits received:', { traitProfile, characterType });
  
  // For Character Lab (creative characters), show creative traits
  if (characterType === 'multi_species' || characterType === 'fictional') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
          Creative Character Profile
        </h2>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Imaginative Character Design
              </h3>
              <p className="text-gray-600 leading-relaxed">
                This creative character has been designed with imaginative traits focused on storytelling, 
                world-building, and narrative depth. The character embodies creative elements that make 
                them unique and engaging for interactive experiences.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-2">🎭 Creative Identity</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {traitProfile.entity_type && (
                    <p><strong>Type:</strong> {traitProfile.entity_type}</p>
                  )}
                  {traitProfile.narrative_domain && (
                    <p><strong>Universe:</strong> {traitProfile.narrative_domain}</p>
                  )}
                  {traitProfile.functional_role && (
                    <p><strong>Role:</strong> {traitProfile.functional_role}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-2">🌟 Core Drives</h4>
                <div className="text-sm text-gray-600">
                  {traitProfile.core_drives?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {traitProfile.core_drives.map((drive, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {drive}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p>Creative motivations and drives</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-2">⚡ Manifestation</h4>
                <div className="text-sm text-gray-600">
                  {traitProfile.physical_form && (
                    <p><strong>Form:</strong> {traitProfile.physical_form}</p>
                  )}
                  {traitProfile.environment && (
                    <p><strong>Environment:</strong> {traitProfile.environment}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-2">💫 Communication</h4>
                <p className="text-sm text-gray-600">
                  {traitProfile.communication_method || 'Creative communication style'}
                </p>
              </div>
            </div>
            
            {traitProfile.description && (
              <div className="text-center mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">
                  ✨ {traitProfile.description}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Surface Triggers */}
        {traitProfile.surface_triggers && traitProfile.surface_triggers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Surface Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {traitProfile.surface_triggers.map((trigger, index) => (
                  <Badge key={index} variant="outline">{trigger}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Creative-specific traits */}
        {traitProfile.unique_abilities && traitProfile.unique_abilities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Unique Abilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {traitProfile.unique_abilities.map((ability, index) => (
                  <Badge key={index} variant="outline">{ability}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personality Summary */}
        {traitProfile.personality_summary && (
          <Card>
            <CardHeader>
              <CardTitle>Personality Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{traitProfile.personality_summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Creative Manifestation (for non-humanoid characters) */}
        {traitProfile.creative_manifestation && (
          <Card>
            <CardHeader>
              <CardTitle>Creative Manifestation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(traitProfile.creative_manifestation).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-sm font-medium text-gray-800 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </p>
                    <p className="text-sm text-gray-600">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Handle historical characters with descriptive content
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
        Historical Character Profile
      </h2>
      
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Historically Accurate Personality
            </h3>
            <p className="text-gray-600 leading-relaxed">
              This historical character has been carefully researched and modeled to reflect authentic 
              personality traits, cultural context, and behavioral patterns from their era. Our advanced 
              character modeling captures the complexity of how they would have thought, felt, and 
              interacted based on historical evidence and period-appropriate worldviews.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">📚 Historical Context</h4>
              <p className="text-sm text-gray-600">
                Grounded in extensive historical research, reflecting the social norms, 
                cultural values, and life experiences typical of their time period and circumstances.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">🧠 Cognitive Patterns</h4>
              <p className="text-sm text-gray-600">
                Thinking patterns and decision-making processes informed by the knowledge, 
                beliefs, and cognitive frameworks available during their historical period.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">💭 Cultural Understanding</h4>
              <p className="text-sm text-gray-600">
                Responses shaped by historical social structures, family dynamics, and the 
                challenges of their era.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">⚖️ Period Values</h4>
              <p className="text-sm text-gray-600">
                Moral foundations and ethical frameworks consistent with their historical 
                context, social class, and cultural background.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
            <p className="text-sm text-gray-700 font-medium">
              ✨ This comprehensive character modeling enables authentic, engaging conversations that 
              capture the historical authenticity and personality nuances that make each interaction unique and memorable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterTraits;
