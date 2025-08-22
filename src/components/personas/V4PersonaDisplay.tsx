import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Globe, Lock, Download, Trash2, User } from 'lucide-react';
import { V4Persona } from '@/types/persona-v4';
import { formatName } from '@/lib/utils';
import { SurveyManagement } from '../surveys/SurveyManagement';
import { PersonaChat } from './PersonaChat';
import PersonaVisibilityToggle from '../persona-details/PersonaVisibilityToggle';
import DeletePersonaButton from '../persona-details/DeletePersonaButton';

interface V4PersonaDisplayProps {
  persona: V4Persona;
  isOwner?: boolean;
  isPublic?: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;
  onDelete?: () => Promise<void>;
  onDownloadJSON?: () => void;
  showChat?: boolean;
  onChatToggle?: () => void;
}

export const V4PersonaDisplay: React.FC<V4PersonaDisplayProps> = ({ 
  persona, 
  isOwner = false, 
  isPublic = false, 
  onVisibilityChange, 
  onDelete, 
  onDownloadJSON,
  showChat = false,
  onChatToggle
}) => {
  
  const fullProfile = persona.full_profile;
  const conversationSummary = persona.conversation_summary;
  
  const renderDemographics = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Demographics & Identity</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><strong>Name:</strong> {conversationSummary?.demographics?.name || persona.name}</div>
          <div><strong>Age:</strong> {String(conversationSummary?.demographics?.age) || String(fullProfile?.identity?.age) || 'Not specified'}</div>
          <div><strong>Gender:</strong> {fullProfile?.identity?.gender || 'Not specified'}</div>
          <div><strong>Pronouns:</strong> {fullProfile?.identity?.pronouns || 'Not specified'}</div>
          <div><strong>Ethnicity:</strong> {fullProfile?.identity?.ethnicity || 'Not specified'}</div>
        </div>
        <div className="space-y-2">
          <div><strong>Occupation:</strong> {conversationSummary?.demographics?.occupation || fullProfile?.identity?.occupation || 'Not specified'}</div>
          <div><strong>Location:</strong> {conversationSummary?.demographics?.location || 'Not specified'}</div>
          <div><strong>Relationship Status:</strong> {fullProfile?.identity?.relationship_status || 'Not specified'}</div>
          <div><strong>Dependents:</strong> {fullProfile?.identity?.dependents !== undefined ? fullProfile.identity.dependents : 'Not specified'}</div>
        </div>
      </div>
      
      {conversationSummary?.demographics?.background_description && (
        <div className="mt-4">
          <strong>Background:</strong>
          <p className="mt-2 text-muted-foreground">{conversationSummary.demographics.background_description}</p>
        </div>
      )}
      
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
              <strong>Directness:</strong> {fullProfile.communication_style.voice_foundation.directness_level || 'Not specified'}
            </div>
            <div>
              <strong>Formality:</strong> {fullProfile.communication_style.voice_foundation.formality_default || 'Not specified'}
            </div>
            <div>
              <strong>Emotional Expression:</strong> {fullProfile.communication_style.voice_foundation.emotional_expression || 'Not specified'}
            </div>
            <div>
              <strong>Pace & Rhythm:</strong> {fullProfile.communication_style.voice_foundation.pace_rhythm || 'Not specified'}
            </div>
          </div>
        )}
        
        {fullProfile?.communication_style?.linguistic_signature?.signature_phrases?.length > 0 && (
          <div>
            <strong>Signature Phrases:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {fullProfile.communication_style.linguistic_signature.signature_phrases.map((phrase, idx) => (
                <Badge key={idx} variant="outline">"{phrase}"</Badge>
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
            <div>Knowledge: {fullProfile?.knowledge_profile ? '✓' : '✗'}</div>
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
  
  const renderKnowledge = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Knowledge Profile</h3>
      <div className="space-y-4">
        {fullProfile?.knowledge_profile && (
          <div className="space-y-3">
            <div>
              <strong>Education Level:</strong> {fullProfile.knowledge_profile.education_level || 'Not specified'}
            </div>
            <div>
              <strong>Vocabulary Level:</strong> {fullProfile.knowledge_profile.vocabulary_ceiling || 'Not specified'}
            </div>
            <div>
              <strong>Learning Style:</strong> {fullProfile.knowledge_profile.learning_style || 'Not specified'}
            </div>
            
            {fullProfile.knowledge_profile.expertise_domains?.length > 0 && (
              <div>
                <strong>Areas of Expertise:</strong>
                <div className="flex flex-wrap gap-1 mt-2">
                  {fullProfile.knowledge_profile.expertise_domains.map((domain, idx) => (
                    <Badge key={idx} variant="secondary">{domain}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {fullProfile.knowledge_profile.knowledge_gaps?.length > 0 && (
              <div>
                <strong>Knowledge Gaps:</strong>
                <div className="flex flex-wrap gap-1 mt-2">
                  {fullProfile.knowledge_profile.knowledge_gaps.map((gap, idx) => (
                    <Badge key={idx} variant="outline">{gap}</Badge>
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
      {/* Enhanced Header with Management Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex gap-4">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {(persona as any).profile_image_url ? (
                <img 
                  src={(persona as any).profile_image_url} 
                  alt={`${persona.name} profile`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-primary/20">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Persona Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{formatName(persona.name)}</h2>
                <Badge variant="default" className="bg-blue-100 text-blue-800">V4 Enhanced</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-4">
                  <span>{persona.conversation_summary?.demographics?.age} years old</span>
                  <span>{persona.conversation_summary?.demographics?.occupation}</span>
                  <span>{persona.conversation_summary?.demographics?.location}</span>
                </div>
                <div>{persona.conversation_summary?.demographics?.background_description}</div>
                <div className="text-xs mt-2">
                  Created: {new Date(persona.created_at).toLocaleDateString()} • 
                  ID: {persona.persona_id}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Owner Controls */}
            {isOwner && (
              <div className="flex items-center gap-2">
                {/* Visibility Toggle */}
                {onVisibilityChange && (
                  <PersonaVisibilityToggle
                    personaId={persona.persona_id}
                    isPublic={isPublic}
                    isOwner={isOwner}
                    onVisibilityChange={onVisibilityChange}
                  />
                )}
                
                {/* Download JSON */}
                {onDownloadJSON && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownloadJSON}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

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
        <TabsList className="grid grid-cols-7 w-full mb-8">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="motivation">Motivation</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="emotional">Emotional</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
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

        <TabsContent value="knowledge" className="space-y-6">
          {renderKnowledge()}
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