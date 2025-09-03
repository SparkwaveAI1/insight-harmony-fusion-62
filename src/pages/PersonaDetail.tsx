
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import PersonaHeader from "@/components/persona-details/PersonaHeader";
import PersonaLoadingState from "@/components/persona-details/PersonaLoadingState";
import PersonaDetailHeader from "@/components/persona-details/PersonaDetailHeader";
import PersonaContent from "@/components/persona-details/PersonaContent";
import NotFoundState from "@/components/persona-details/NotFoundState";
import DeletePersonaButton from "@/components/persona-details/DeletePersonaButton";
import { usePersonaDetail } from "@/hooks/usePersonaDetail";
import { ensureStorageBuckets } from "@/services/supabase/storage/bucketService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { V4PersonaDisplay } from "@/components/personas/V4PersonaDisplay";
import { V4Persona } from "@/types/persona-v4";
import { isV4Persona } from "@/utils/personaDetection";

// Create a QueryClient for this route
const queryClient = new QueryClient();

const PersonaDetail = () => {
  const [showChat, setShowChat] = useState(false);
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  
  const {
    persona,
    isLoading,
    isPublic,
    isOwner,
    handleVisibilityChange,
    handlePersonaDeleted,
    handleNameUpdate,
    handleDescriptionUpdate,
    handleImageGenerated,
    handlePersonaUpdated
  } = usePersonaDetail();

  // Ensure storage buckets exist when the component mounts
  useEffect(() => {
    const setupStorage = async () => {
      await ensureStorageBuckets();
    };
    setupStorage();
  }, []);


  // Wrapper function to handle V4 persona updates with proper typing
  const handleV4PersonaUpdated = (updatedPersona: V4Persona) => {
    // Convert V4Persona to Persona-compatible format for the hook
    const personaWithIsPublic = {
      ...updatedPersona,
      is_public: updatedPersona.is_public
    };
    handlePersonaUpdated(personaWithIsPublic as any);
  };



  // V4 validation and data preference
  const isV4 = persona?.schema_version?.startsWith('v4');
  
  // Debug logging for Step 2 verification
  if (persona && isV4) {
    const fp = (persona?.full_profile ?? {}) as {
      trait_profile?: any;
      motivation_profile?: any;
      communication_style?: any;
      metadata?: any;
    };
    console.debug('fp keys:', Object.keys(fp || {}));
    console.debug('trait_profile keys:', Object.keys((fp?.trait_profile || {})));
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Section className="bg-gradient-to-b from-[#F5F5F7] via-background to-background pt-24">
            <div className="container px-4 mx-auto">
              <PersonaHeader 
                showChatButton={Boolean(persona)}
                chatButtonText={`Chat with ${persona?.name || 'Persona'}`}
                onChatToggle={() => setShowChat(!showChat)}
                isChatOpen={showChat}
              />
              
              {isLoading ? (
                <PersonaLoadingState />
              ) : !persona ? (
                <NotFoundState />
              ) : !isV4 ? (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>
                    This persona is not V4 and cannot be displayed. Schema version: {persona?.schema_version || 'missing'}
                  </AlertDescription>
                </Alert>
              ) : (
                // V4 Persona - Use dedicated V4 display with V4 badge
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">V4</Badge>
                    <span className="text-sm text-muted-foreground">Enhanced persona with rich trait data</span>
                  </div>
                  <V4PersonaDisplay 
                    persona={persona as V4Persona}
                    isOwner={isOwner}
                    isPublic={isPublic}
                    onVisibilityChange={handleVisibilityChange}
                    onDelete={handlePersonaDeleted}
                    onImageGenerated={handleImageGenerated}
                    onPersonaUpdated={handleV4PersonaUpdated}
                    showChat={showChat}
                    onChatToggle={() => setShowChat(!showChat)}
                  />
                </div>
              )}
            </div>
          </Section>
        </main>
        <Footer />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
};

export default PersonaDetail;
