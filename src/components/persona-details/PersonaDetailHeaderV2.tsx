import React, { useState } from "react";
import { Download, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui-custom/Card";
import PersonaAvatar from "./PersonaAvatar";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaNameEditor from "./PersonaNameEditor";
import PersonaDescriptionEditor from "./PersonaDescriptionEditor";
import PersonaImageGenerationDialog from "./PersonaImageGenerationDialog";
import PersonaEnhancementDialog from "./PersonaEnhancementDialog";
import { DbPersona } from "@/services/persona";
import { Persona } from "@/services/persona/types";
import { PersonaValidationResult } from "@/services/persona/validation/personaValidation";

interface PersonaDetailHeaderV2Props {
  persona: DbPersona;
  isOwner: boolean;
  isPublic: boolean;
  isGeneratingImage: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  onDelete: () => Promise<void>;
  onNameUpdate: (name: string) => Promise<void>;
  onDescriptionUpdate: (description: string) => Promise<void>;
  onImageGenerated: () => Promise<string | null>;
  onDownloadJSON: () => void;
  onChatClick: () => void;
  onPersonaUpdated?: (updatedPersona: DbPersona) => void;
}

export default function PersonaDetailHeaderV2({
  persona,
  isOwner,
  isPublic,
  isGeneratingImage,
  onVisibilityChange,
  onDelete,
  onNameUpdate,
  onDescriptionUpdate,
  onImageGenerated,
  onDownloadJSON,
  onChatClick,
  onPersonaUpdated
}: PersonaDetailHeaderV2Props) {
  const [enhancementDialogOpen, setEnhancementDialogOpen] = useState(false);
  
  // Convert DbPersona to Persona format for components that expect it
  const legacyPersona: Persona = {
    id: persona.id,
    persona_id: persona.persona_id,
    name: persona.name,
    description: persona.description || '',
    profile_image_url: persona.profile_image_url || undefined,
    creation_date: persona.created_at,
    created_at: persona.created_at,
    persona_context: 'legacy',
    persona_type: 'legacy' as any,
    metadata: {
      age: String(persona.persona_data?.identity?.age || ''),
      gender: persona.persona_data?.identity?.gender || '',
      race_ethnicity: persona.persona_data?.identity?.ethnicity || '',
      education_level: '',
      occupation: persona.persona_data?.identity?.occupation || '',
      employment_type: '',
      income_level: '',
      social_class_identity: '',
      marital_status: persona.persona_data?.identity?.relationship_status || ''
    },
    behavioral_modulation: {},
    interview_sections: [],
    linguistic_profile: {},
    preinterview_tags: [],
    trait_profile: {
      big_five: {
        openness: persona.persona_data.cognitive_profile?.big_five?.openness || 0.5,
        conscientiousness: persona.persona_data.cognitive_profile?.big_five?.conscientiousness || 0.5,
        extraversion: persona.persona_data.cognitive_profile?.big_five?.extraversion || 0.5,
        agreeableness: persona.persona_data.cognitive_profile?.big_five?.agreeableness || 0.5,
        neuroticism: persona.persona_data.cognitive_profile?.big_five?.neuroticism || 0.5
      },
      moral_foundations: {
        care: persona.persona_data.cognitive_profile?.moral_foundations?.care_harm || 0.5,
        fairness: persona.persona_data.cognitive_profile?.moral_foundations?.fairness_cheating || 0.5,
        loyalty: persona.persona_data.cognitive_profile?.moral_foundations?.loyalty_betrayal || 0.5,
        authority: persona.persona_data.cognitive_profile?.moral_foundations?.authority_subversion || 0.5,
        sanctity: persona.persona_data.cognitive_profile?.moral_foundations?.sanctity_degradation || 0.5,
        liberty: persona.persona_data.cognitive_profile?.moral_foundations?.liberty_oppression || 0.5
      }
    },
    emotional_triggers: persona.persona_data.emotional_triggers || { positive_triggers: [], negative_triggers: [] }
  };

  // Create a basic validation result for enhancement
  const validationResult: PersonaValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    completeness: {
      hasRealTraits: true,
      hasEmotionalTriggers: true,
      hasInterviewResponses: true,
      hasMetadata: true
    }
  };
  return (
    <Card className="p-8 mb-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column - Avatar and Controls */}
        <div className="flex flex-col items-center space-y-4 flex-shrink-0">
          <PersonaAvatar
            persona={legacyPersona}
            isOwner={isOwner}
            isGeneratingImage={isGeneratingImage}
            onGenerateImage={onImageGenerated}
          />
          
          {isOwner && (
            <PersonaImageGenerationDialog
              persona={legacyPersona}
              onImageGenerated={onImageGenerated}
            />
          )}
        </div>

        {/* Right Column - Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header Section with Name and Chat Button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              {isOwner ? (
                <PersonaNameEditor
                  personaId={persona.persona_id}
                  initialName={persona.name}
                  onNameUpdate={onNameUpdate}
                />
              ) : (
                <h1 className="text-3xl font-bold mb-3">{persona.name}</h1>
              )}
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">V2 Research-Grade Persona</Badge>
                {isPublic && <Badge variant="secondary">Public</Badge>}
                {!isPublic && isOwner && <Badge variant="outline">Private</Badge>}
              </div>
            </div>

            {/* Prominent Chat Button */}
            <Button 
              onClick={onChatClick} 
              size="lg"
              className="flex-shrink-0"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat with {persona.name}
            </Button>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Description</h3>
            {isOwner ? (
              <PersonaDescriptionEditor
                personaId={persona.persona_id}
                initialDescription={persona.description || ''}
                onDescriptionUpdate={onDescriptionUpdate}
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                {persona.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Key persona information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-y">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Age</h3>
              <p className="text-base">{persona.persona_data?.identity?.age || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Location</h3>
              <p className="text-base">
                {persona.persona_data?.identity?.location 
                  ? `${persona.persona_data.identity.location.city}, ${persona.persona_data.identity.location.region}`
                  : 'Not specified'
                }
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Occupation</h3>
              <p className="text-base">{persona.persona_data?.identity?.occupation || 'Not specified'}</p>
            </div>
          </div>

          {/* Owner controls */}
          {isOwner && (
            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <PersonaVisibilityToggle
                  personaId={persona.persona_id}
                  isPublic={isPublic}
                  isOwner={isOwner}
                  onVisibilityChange={onVisibilityChange}
                />
                <Button 
                  variant="outline" 
                  onClick={() => setEnhancementDialogOpen(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enhance Persona
                </Button>
              </div>
              <Button variant="outline" onClick={onDownloadJSON}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Enhancement Dialog */}
      {isOwner && onPersonaUpdated && (
        <PersonaEnhancementDialog
          open={enhancementDialogOpen}
          onOpenChange={setEnhancementDialogOpen}
          persona={legacyPersona}
          validationResult={validationResult}
          onPersonaUpdated={(updatedPersona) => {
            // Convert back to DbPersona format
            const updatedDbPersona: DbPersona = {
              ...persona,
              name: updatedPersona.name,
              description: updatedPersona.description,
              persona_data: {
                ...persona.persona_data,
                cognitive_profile: {
                  ...persona.persona_data.cognitive_profile,
                  big_five: {
                    openness: updatedPersona.trait_profile.big_five?.openness || 0.5,
                    conscientiousness: updatedPersona.trait_profile.big_five?.conscientiousness || 0.5,
                    extraversion: updatedPersona.trait_profile.big_five?.extraversion || 0.5,
                    agreeableness: updatedPersona.trait_profile.big_five?.agreeableness || 0.5,
                    neuroticism: updatedPersona.trait_profile.big_five?.neuroticism || 0.5
                  },
                  moral_foundations: {
                    care_harm: updatedPersona.trait_profile.moral_foundations?.care || 0.5,
                    fairness_cheating: updatedPersona.trait_profile.moral_foundations?.fairness || 0.5,
                    loyalty_betrayal: updatedPersona.trait_profile.moral_foundations?.loyalty || 0.5,
                    authority_subversion: updatedPersona.trait_profile.moral_foundations?.authority || 0.5,
                    sanctity_degradation: updatedPersona.trait_profile.moral_foundations?.sanctity || 0.5,
                    liberty_oppression: updatedPersona.trait_profile.moral_foundations?.liberty || 0.5
                  }
                },
                emotional_triggers: updatedPersona.emotional_triggers
              }
            };
            onPersonaUpdated(updatedDbPersona);
          }}
        />
      )}
    </Card>
  );
}