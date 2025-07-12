
import React, { useEffect } from "react";
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
import { downloadPersonaAsJSON } from "@/utils/downloadUtils";

// Create a QueryClient for this route
const queryClient = new QueryClient();

const PersonaDetail = () => {
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

  const handleDownloadJSON = () => {
    if (persona) {
      downloadPersonaAsJSON(persona);
    }
  };

  const handleChatClick = () => {
    if (personaId) {
      navigate(`/persona-chat/${personaId}`);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Section className="bg-gradient-to-b from-[#F5F5F7] via-background to-background pt-24">
            <div className="container px-4 mx-auto">
              <PersonaHeader />
              
              {isLoading ? (
                <PersonaLoadingState />
              ) : !persona ? (
                <NotFoundState />
              ) : (
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
                    onDownloadJSON={handleDownloadJSON}
                    onChatClick={handleChatClick}
                    onPersonaUpdated={handlePersonaUpdated}
                  />
                  
                  <PersonaContent persona={persona} />
                  
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
