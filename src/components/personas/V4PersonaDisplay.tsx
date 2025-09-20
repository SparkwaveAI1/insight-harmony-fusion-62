import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft, User, Download, ImageIcon } from 'lucide-react';
import { V4Persona } from '@/types/persona-v4';
import { SurveyManagement } from '../surveys/SurveyManagement';
import PersonaVisibilityToggle from '../persona-details/PersonaVisibilityToggle';
import DeletePersonaButton from '../persona-details/DeletePersonaButton';
import PersonaImageGenerationDialog from '../persona-details/PersonaImageGenerationDialog';
import { V4PersonaCompletionCard } from '@/components/persona-details/V4PersonaCompletionCard';
import PersonaMemoriesTab from '../persona-details/PersonaMemoriesTab';
import PersonaCollectionsTab from '../persona-details/PersonaCollectionsTab';
import { useNavigate } from 'react-router-dom';
import { getPersonaAge, getPersonaLocation, getPersonaBackgroundDescription, getPersonaDisplayName } from '@/utils/personaDisplayUtils';
import { supabase } from '@/integrations/supabase/client';
import { usePersonaImageGeneration } from '@/hooks/usePersonaImageGeneration';

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

interface PersonaCollection {
  collection_id: string;
  name: string;
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
  const [collections, setCollections] = useState<PersonaCollection[]>([]);
  const { isGenerating, generateImage } = usePersonaImageGeneration(persona);
  
  const fullProfile = persona.full_profile;
  const conversationSummary = persona.conversation_summary;

  useEffect(() => {
    loadCollections(persona.persona_id);
  }, [persona.persona_id]);

  const loadCollections = async (personaId: string) => {
    try {
      const { data, error } = await supabase
        .from('collection_personas')
        .select(`
          collection_id,
          collections!inner(name)
        `)
        .eq('persona_id', personaId);

      if (error) throw error;

      const collectionData = data?.map(item => ({
        collection_id: item.collection_id,
        name: (item.collections as any).name
      })) || [];

      setCollections(collectionData);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const getCharacterCount = (text: string, limit: number) => {
    const count = text.length;
    const percentage = (count / limit) * 100;
    
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(persona, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${persona.name.replace(/\s+/g, '_')}_persona_profile.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRegenerateImage = async () => {
    const result = await generateImage(false); // Don't save to gallery by default
    if (result && onImageGenerated) {
      onImageGenerated();
    }
  };

  const displayName = getPersonaDisplayName(persona);
  const age = getPersonaAge(persona);
  const location = getPersonaLocation(persona);

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
      </div>
    </Card>
  );

  const renderCommunication = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Communication Style</h3>
      <div className="space-y-4">
        {conversationSummary?.communication_summary && (
          <div>
            <strong>Style Summary:</strong>
            <p className="mt-2 text-muted-foreground">{conversationSummary.communication_summary}</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderTraits = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Personality Traits</h3>
      <div className="space-y-4">
        {conversationSummary?.trait_summary && (
          <div>
            <strong>Trait Summary:</strong>
            <p className="mt-2 text-muted-foreground">{conversationSummary.trait_summary}</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderEmotional = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Emotional Profile</h3>
      <div className="space-y-4">
        {fullProfile?.emotional_profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Stress Responses:</strong>
              <ul className="mt-2 text-muted-foreground">
                {fullProfile.emotional_profile.stress_responses?.map((response, index) => (
                  <li key={index}>• {response}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Emotional Regulation:</strong>
              <p className="mt-2 text-muted-foreground">{fullProfile.emotional_profile.emotional_regulation || 'Not specified'}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/persona-library')}
              className="gap-2 p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Library
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">{displayName}</span>
          </div>
        </div>

        {/* Identity Header - Always Visible */}
        <Card className="p-6 mb-6 relative">
          {/* Chat Button - Upper Right */}
          <div className="absolute top-4 right-4">
            <Button 
              onClick={() => navigate(`/persona-detail/${persona.persona_id}/chat`)}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base font-semibold"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat with {displayName.split(' ')[0] || 'Persona'}
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 pr-0 lg:pr-60">
            {/* Avatar/Photo */}
            <div className="flex-shrink-0 space-y-3">
              {persona.profile_image_url ? (
                <img 
                  src={persona.profile_image_url} 
                  alt={`${displayName} profile`}
                  className="w-48 h-48 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center border">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              {/* Regenerate Image Button - Only show for owners */}
              {isOwner && (
                <div className="space-y-2">
                  {/* Quick regenerate button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center gap-2"
                    disabled={isGenerating}
                    onClick={handleRegenerateImage}
                  >
                    <ImageIcon className="h-4 w-4" />
                    {isGenerating ? 'Generating...' : persona.profile_image_url ? 'Regenerate Image' : 'Generate Image'}
                  </Button>
                  
                  {/* Advanced options through dialog */}
                  <PersonaImageGenerationDialog
                    persona={persona as any} // Type compatibility - V4Persona to Persona adapter
                    onImageGenerated={() => onImageGenerated?.()}
                    trigger={
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs text-muted-foreground hover:text-foreground"
                      >
                        Advanced Options
                      </Button>
                    }
                  />
                </div>
              )}
            </div>

            {/* Name + Description */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                {age && (
                  <div className="text-lg text-muted-foreground mb-2">
                    {age} years old {location && `• ${location}`}
                  </div>
                )}
                 {/* Description (Character Essence) */}
                 {persona.conversation_summary?.character_description && (
                   <div className="space-y-1">
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-medium text-muted-foreground">Description</span>
                       <span className={`text-xs ${getCharacterCount(persona.conversation_summary.character_description, 300)}`}>
                         {persona.conversation_summary.character_description.length}/300 characters
                       </span>
                     </div>
                     <p className="text-muted-foreground leading-relaxed italic">
                       {persona.conversation_summary.character_description}
                     </p>
                   </div>
                 )}

                 {/* Background Story */}
                 <div className="space-y-1">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-muted-foreground">Background</span>
                      <span className={`text-xs ${getCharacterCount(getPersonaBackgroundDescription(persona) || 'No background available', 400)}`}>
                        {(getPersonaBackgroundDescription(persona) || 'No background available').length}/400 characters
                     </span>
                   </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {getPersonaBackgroundDescription(persona) || 'No background available'}
                   </p>
                 </div>
              </div>

              {/* Collection Badges */}
              {collections.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => (
                    <Badge 
                      key={collection.collection_id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => navigate(`/collection/${collection.collection_id}`)}
                    >
                      {collection.name}
                    </Badge>
                  ))}
                </div>
              )}

              {collections.length === 0 && (
                <Badge variant="outline">No collections</Badge>
              )}
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex flex-col gap-3">
                {/* Download JSON Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJSON}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download JSON
                </Button>
                
                {/* Visibility Toggle */}
                {onVisibilityChange && (
                  <PersonaVisibilityToggle
                    personaId={persona.persona_id}
                    isPublic={isPublic}
                    isOwner={isOwner}
                    onVisibilityChange={onVisibilityChange}
                  />
                )}
              </div>
            )}
          </div>
        </Card>
      
        {/* Tabbed Content */}
        <Tabs defaultValue="demographics" className="w-full">
          <TabsList className="grid grid-cols-7 w-full mb-8">
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="motivation">Motivation</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="traits">Traits</TabsTrigger>
            <TabsTrigger value="emotional">Emotional</TabsTrigger>
            <TabsTrigger value="memories">Memories</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
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

          <TabsContent value="memories" className="space-y-6">
            <PersonaMemoriesTab personaId={persona.persona_id} />
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <PersonaCollectionsTab personaId={persona.persona_id} />
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
    </div>
  );
};