
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
              ) : isV4Persona(persona) ? (
                // V4 Persona - Use dedicated V4 display with built-in management
                <V4PersonaDisplay 
                  persona={persona}
                  isOwner={isOwner}
                  isPublic={isPublic}
                  onVisibilityChange={handleVisibilityChange}
                  onDelete={handlePersonaDeleted}
                  onImageGenerated={handleImageGenerated}
                  onPersonaUpdated={handleV4PersonaUpdated}
                  showChat={showChat}
                  onChatToggle={() => setShowChat(!showChat)}
                />
              ) : (
                // Legacy Persona - Use original layout
                <>
                  <PersonaDetailHeader 
                    persona={persona}
                    isOwner={isOwner}
                    isPublic={isPublic}
                    onVisibilityChange={handleVisibilityChange}
                    onDelete={handlePersonaDeleted}
                    onNameUpdate={handleNameUpdate}
                    onDescriptionUpdate={handleDescriptionUpdate}
                    onImageGenerated={handleImageGenerated}
                  onPersonaUpdated={handlePersonaUpdated}
                  />
                  
                  <PersonaContent persona={persona} isOwner={isOwner} />
                  
                  {/* Move Delete button to the very bottom of the page */}
                  {isOwner && (
                    <div className="max-w-md mx-auto mt-16 mb-8">
                      <DeletePersonaButton 
                        onDelete={handlePersonaDeleted} 
                        isOwner={isOwner} 
                      />
                    </div>
                  )}
                </>
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
