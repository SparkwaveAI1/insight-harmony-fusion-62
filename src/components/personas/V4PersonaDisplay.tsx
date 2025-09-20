import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Globe, Lock, Trash2, User, Plus, ImageIcon, Download } from 'lucide-react';
import { V4Persona } from '@/types/persona-v4';
import { formatName } from '@/lib/utils';
import { SurveyManagement } from '../surveys/SurveyManagement';
import { PersonaChat } from './PersonaChat';
import PersonaVisibilityToggle from '../persona-details/PersonaVisibilityToggle';
import DeletePersonaButton from '../persona-details/DeletePersonaButton';
import PersonaImageGenerationDialog from '../persona-details/PersonaImageGenerationDialog';
import { V4PersonaCompletionCard } from '@/components/persona-details/V4PersonaCompletionCard';
import PersonaMemoriesTab from '../persona-details/PersonaMemoriesTab';
import PersonaCollectionsTab from '../persona-details/PersonaCollectionsTab';
import { useNavigate } from 'react-router-dom';
import { getPersonaAge, getPersonaLocation, getPersonaBackgroundDescription } from '@/utils/personaDisplayUtils';
import { downloadPersonaAsJSON } from '@/utils/downloadUtils';
interface V4PersonaDisplayProps {
  persona: V4Persona;
  isOwner?: boolean;
  isPublic?: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;
  onDelete?: () => Promise<void>;
  onImageGenerated?: () => void;
  onPersonaUpdated?: (updatedPersona: V4Persona) => void;
  showChat?: boolean;
  onChatToggle?: () => void;
}

export const V4PersonaDisplay: React.FC<V4PersonaDisplayProps> = ({ 
  persona, 
  isOwner = false, 
  isPublic = false, 
  onVisibilityChange, 
  onDelete, 
  onImageGenerated,
  onPersonaUpdated,
  showChat = false,
  onChatToggle
}) => {
  const navigate = useNavigate();
  
  const fullProfile = persona.full_profile;
  const conversationSummary = persona.conversation_summary;
  
  const renderDemographics = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Demographics & Identity</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><strong>Name:</strong> {conversationSummary?.demographics?.name || persona.name}</div>
          <div><strong>Age:</strong> {getPersonaAge(persona) ?? conversationSummary?.demographics?.age ?? fullProfile?.identity?.age ?? 'Not specified'}</div>
          <div><strong>Gender:</strong> {fullProfile?.identity?.gender || 'Not specified'}</div>
          <div><strong>Pronouns:</strong> {fullProfile?.identity?.pronouns || 'Not specified'}</div>
          <div><strong>Ethnicity:</strong> {fullProfile?.identity?.ethnicity || 'Not specified'}</div>
        </div>
        <div className="space-y-2">
          <div><strong>Occupation:</strong> {conversationSummary?.demographics?.occupation || fullProfile?.identity?.occupation || 'Not specified'}</div>
          <div><strong>Location:</strong> {getPersonaLocation(persona) || conversationSummary?.demographics?.location || 'Not specified'}</div>
          <div><strong>Relationship Status:</strong> {fullProfile?.identity?.relationship_status || 'Not specified'}</div>
          <div><strong>Dependents:</strong> {fullProfile?.identity?.dependents !== undefined ? fullProfile.identity.dependents : 'Not specified'}</div>
        </div>
      </div>
      
      {/* Note: Description and Background are now in the main header section */}
      
      {conversationSummary?.physical_description && (
        <div className="mt-4">
          <strong>Physical Description:</strong>
          <p className="mt-2 text-muted-foreground">{conversationSummary.physical_description}</p>
        </div>
      )}
    </Card>
  );
  
  const renderMotivation = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Motivation & Goals</h3>
      <div className="space-y-4">
        {conversationSummary?.motivation_summary && (
          <div>
            <strong>Primary Drivers:</strong>
            <p className="mt-2 text-muted-foreground">{conversationSummary.motivation_summary}</p>
          </div>
        )}
        
        {conversationSummary?.goal_priorities && (
          <div>
            <strong>Goal Priorities:</strong>
            <p className="mt-2 text-muted-foreground">{conversationSummary.goal_priorities}</p>
          </div>
        )}
        
        {conversationSummary?.want_vs_should_pattern && (
          <div>
            <strong>Want vs Should Pattern:</strong>
            <p className="mt-2 text-muted-foreground">{conversationSummary.want_vs_should_pattern}</p>
          </div>
        )}
        
        {fullProfile?.motivation_profile?.primary_drivers && (
          <div>
            <strong>Detailed Motivation Drivers:</strong>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {Object.entries(fullProfile.motivation_profile.primary_drivers).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <Badge variant="secondary">{String(value)}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
  
  const renderCommunication = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Communication Style</h3>
      <div className="space-y-4">
        {conversationSummary?.voice_summary && (
          <div>
            <strong>Voice Summary:</strong>
            <p className="mt-2 text-muted-foreground">{conversationSummary.voice_summary}</p>
          </div>
        )}
        
        {fullProfile?.communication_style?.voice_foundation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Directness:</strong> {fullProfile.communication_style.voice_foundation.directness || 'Not specified'}
            </div>
            <div>
              <strong>Formality:</strong> {fullProfile.communication_style.voice_foundation.formality || 'Not specified'}
            </div>
            <div>
              <strong>Empathy Level:</strong> {fullProfile.communication_style.voice_foundation.empathy_level || 'Not specified'}
            </div>
            <div>
              <strong>Pace & Rhythm:</strong> {fullProfile.communication_style.voice_foundation.pace_rhythm || 'Not specified'}
            </div>
          </div>
        )}
        
        {fullProfile?.communication_style?.style_markers?.metaphor_domains?.length > 0 && (
          <div>
            <strong>Metaphor Domains:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {fullProfile.communication_style.style_markers.metaphor_domains.map((domain, idx) => (
                <Badge key={idx} variant="outline">{domain}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {conversationSummary?.voice_summary && (
          <div>
            <strong>Communication Summary:</strong>
            <p className="mt-2 text-muted-foreground">{conversationSummary.voice_summary}</p>
          </div>
        )}
      </div>
    </Card>
  );
  
  const renderTraits = () => (
    <div className="space-y-6">
      {/* Show available V4 trait data */}
      <Card className="p-6">
        <h4 className="text-md font-semibold mb-3">V4 Full Profile Data</h4>
        <div className="space-y-3">
          <div><strong>Available sections:</strong></div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Identity: {fullProfile?.identity ? '✓' : '✗'}</div>
            <div>Motivation: {fullProfile?.motivation_profile ? '✓' : '✗'}</div>
            <div>Communication: {fullProfile?.communication_style ? '✓' : '✗'}</div>
            <div>Emotional: {fullProfile?.emotional_profile ? '✓' : '✗'}</div>
            <div>Sexuality: {fullProfile?.sexuality_profile ? '✓' : '✗'}</div>
            <div>Daily Life: {fullProfile?.daily_life ? '✓' : '✗'}</div>
          </div>
          
          {/* Debug: Show actual structure */}
          <details className="mt-4">
            <summary className="cursor-pointer font-mono text-sm">Debug: Full Profile Structure</summary>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40 mt-2">
              {JSON.stringify(fullProfile, null, 2)}
            </pre>
          </details>
        </div>
      </Card>
      
      {/* Additional trait categories can be added here */}
    </div>
  );
  
  const renderEmotional = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Emotional Profile</h3>
      <div className="space-y-4">
        {conversationSummary?.motivation_summary && (
          <div>
            <strong>Motivation Context:</strong>
            <p className="mt-2 text-muted-foreground">{conversationSummary.motivation_summary}</p>
          </div>
        )}
        
        {fullProfile?.emotional_profile && (
          <div className="space-y-3">
            {fullProfile.emotional_profile.positive_triggers?.length > 0 && (
              <div>
                <strong>Positive Triggers:</strong>
                <div className="flex flex-wrap gap-1 mt-2">
                  {fullProfile.emotional_profile.positive_triggers.map((trigger, idx) => (
                    <Badge key={idx} variant="default" className="bg-green-100 text-green-800">{trigger}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {fullProfile.emotional_profile.negative_triggers?.length > 0 && (
              <div>
                <strong>Negative Triggers:</strong>
                <div className="flex flex-wrap gap-1 mt-2">
                  {fullProfile.emotional_profile.negative_triggers.map((trigger, idx) => (
                    <Badge key={idx} variant="destructive" className="bg-red-100 text-red-800">{trigger}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {fullProfile.emotional_profile.explosive_triggers?.length > 0 && (
              <div>
                <strong>Explosive Triggers:</strong>
                <div className="flex flex-wrap gap-1 mt-2">
                  {fullProfile.emotional_profile.explosive_triggers.map((trigger, idx) => (
                    <Badge key={idx} variant="destructive" className="bg-orange-100 text-orange-800">{trigger}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {fullProfile.emotional_profile.emotional_regulation && (
              <div>
                <strong>Emotional Regulation:</strong>
                <p className="mt-2 text-muted-foreground">{fullProfile.emotional_profile.emotional_regulation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
  
  const renderSexuality = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Sexuality Profile</h3>
      <div className="space-y-4">
        {fullProfile?.sexuality_profile && (
          <div className="space-y-3">
            <div>
              <strong>Orientation:</strong> {fullProfile.sexuality_profile.orientation || 'Not specified'}
            </div>
            <div>
              <strong>Expression Style:</strong> {fullProfile.sexuality_profile.expression_style || 'Not specified'}
            </div>
            <div>
              <strong>Relationship Norms:</strong> {fullProfile.sexuality_profile.relationship_norms || 'Not specified'}
            </div>
            <div>
              <strong>Comfort Level:</strong> {fullProfile.sexuality_profile.boundaries?.comfort_level || 'Not specified'}
            </div>
            
            {fullProfile.sexuality_profile.boundaries?.topics_off_limits?.length > 0 && (
              <div>
                <strong>Topics Off Limits:</strong>
                <div className="flex flex-wrap gap-1 mt-2">
                  {fullProfile.sexuality_profile.boundaries.topics_off_limits.map((topic, idx) => (
                    <Badge key={idx} variant="outline">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      {/* V4 Persona Completion Card */}
      <V4PersonaCompletionCard 
        persona={persona} 
        onPersonaUpdated={onPersonaUpdated}
      />

      {/* Enhanced Header with Management Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex gap-4">
            {/* Profile Image */}
            <div className="flex-shrink-0 relative group">
              {isOwner && onImageGenerated ? (
                <PersonaImageGenerationDialog
                  persona={persona as any}
                  onImageGenerated={onImageGenerated}
                  trigger={
                    <div className="cursor-pointer" onClick={(e) => {
                      console.log("Photo clicked", e);
                      console.log("Persona has image:", !!persona.profile_image_url);
                    }}>
                      {persona.profile_image_url ? (
                        <img 
                          src={persona.profile_image_url} 
                          alt={`${persona.name} profile`}
                          className="w-48 h-48 rounded-lg object-cover border-2 border-primary/20 hover:border-primary/40 transition-colors"
                        />
                      ) : (
                        <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center border-2 border-primary/20 hover:border-primary/40 transition-colors">
                          <User className="h-24 w-24 text-muted-foreground" />
                        </div>
                      )}
                      {/* Overlay hint */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="text-white text-center">
                          <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-xs">
                            {persona.profile_image_url ? "Change Photo" : "Add Photo"}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              ) : (
                <>
                  {persona.profile_image_url ? (
                    <img 
                      src={persona.profile_image_url} 
                      alt={`${persona.name} profile`}
                      className="w-48 h-48 rounded-lg object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center border-2 border-primary/20">
                      <User className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Persona Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{formatName(persona.name)}</h2>
              </div>
                <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-4">
                  <span>{persona.conversation_summary?.demographics?.age} years old</span>
                  <span>{persona.conversation_summary?.demographics?.occupation}</span>
                  <span>{persona.conversation_summary?.demographics?.location}</span>
                </div>
                
                {/* Description (Character Essence) - FIRST in top box */}
                {(persona.conversation_summary?.personality_summary || persona.conversation_summary?.character_description) && (
                  <div>
                    <div className="flex items-center justify-between">
                      <strong>Description:</strong>
                      <span className="text-xs text-muted-foreground">
                        {(persona.conversation_summary?.personality_summary || persona.conversation_summary?.character_description || "").length}/300 characters
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground italic">
                      {persona.conversation_summary?.personality_summary || persona.conversation_summary?.character_description}
                    </p>
                  </div>
                )}
                
                <div className="text-xs mt-2">
                  Created: {new Date(persona.created_at).toLocaleDateString()} • 
                  ID: {persona.persona_id}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Chat Button - Most Prominent */}
            {onChatToggle && (
              <Button
                onClick={onChatToggle}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg font-semibold"
              >
                <MessageCircle className="mr-3 h-6 w-6" />
                {showChat ? 'Hide Chat' : `Chat with ${persona.name}`}
              </Button>
            )}
            
            {/* Download JSON Button - Available to all users */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadPersonaAsJSON(persona)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download JSON
            </Button>
            
            {/* Owner Controls */}
            {isOwner && (
              <div className="flex items-center gap-2">
                {/* Visibility Toggle */}
                {onVisibilityChange && (
                  <div>
                    <PersonaVisibilityToggle
                      personaId={persona.persona_id}
                      isPublic={isPublic}
                      isOwner={isOwner}
                      onVisibilityChange={onVisibilityChange}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Background Section - SECOND, outside/below top box */}
      {persona.conversation_summary?.demographics?.background_description && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Background</h3>
            <span className="text-xs text-muted-foreground">
              {persona.conversation_summary.demographics.background_description.length}/400 characters
            </span>
          </div>
          <div className="space-y-2">
            {persona.conversation_summary.demographics.background_description.length > 300 ? (
              <details className="group">
                <summary className="cursor-pointer text-muted-foreground">
                  <span className="group-open:hidden">
                    {persona.conversation_summary.demographics.background_description.slice(0, 200)}...
                  </span>
                  <span className="font-medium text-primary ml-2 group-open:hidden">Read more</span>
                </summary>
                <p className="text-muted-foreground mt-2">
                  {persona.conversation_summary.demographics.background_description}
                </p>
              </details>
            ) : (
              <p className="text-muted-foreground">
                {persona.conversation_summary.demographics.background_description}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Chat Section - Controlled from parent */}
      {showChat && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Chat with {persona.name}</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onChatToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <PersonaChat 
            persona={persona} 
            personaId={persona.persona_id}
            height="h-[500px]"
          />
        </Card>
      )}
      
      {/* Tabbed Content */}
      <Tabs defaultValue="demographics" className="w-full">
        <TabsList className="grid grid-cols-9 w-full mb-8">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="motivation">Motivation</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="emotional">Emotional</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="memories">Memories</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics" className="space-y-6">
          {renderDemographics()}
        </TabsContent>

        <TabsContent value="motivation" className="space-y-6">
          {renderMotivation()}
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          {renderCommunication()}
        </TabsContent>

        <TabsContent value="traits" className="space-y-6">
          {renderTraits()}
        </TabsContent>

        <TabsContent value="emotional" className="space-y-6">
          {renderEmotional()}
        </TabsContent>

        <TabsContent value="sexuality" className="space-y-6">
          {renderSexuality()}
        </TabsContent>

        <TabsContent value="memories" className="space-y-6">
          <PersonaMemoriesTab personaId={persona.persona_id} />
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <PersonaCollectionsTab personaId={persona.persona_id} />
        </TabsContent>

        <TabsContent value="surveys" className="space-y-6">
          <SurveyManagement 
            personaId={persona.persona_id} 
            isOwner={isOwner}
          />
        </TabsContent>
      </Tabs>
      
      {/* Delete Button - Bottom of Page for Owners */}
      {isOwner && onDelete && (
        <div className="max-w-md mx-auto mt-16 mb-8">
          <DeletePersonaButton 
            onDelete={onDelete} 
            isOwner={isOwner} 
          />
        </div>
      )}
    </div>
  );
};