
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import PersonaHeader from "@/components/persona-details/PersonaHeader";
import PersonaLoadingState from "@/components/persona-details/PersonaLoadingState";
import PersonaDetailHeader from "@/components/persona-details/PersonaDetailHeader";
import PersonaContent from "@/components/persona-details/PersonaContent";
import NotFoundState from "@/components/persona-details/NotFoundState";
import { usePersonaDetail } from "@/hooks/usePersonaDetail";

const PersonaDetail = () => {
  const {
    persona,
    isLoading,
    isPublic,
    isOwner,
    handleVisibilityChange,
    handlePersonaDeleted
  } = usePersonaDetail();

  return (
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
                />
                
                <PersonaContent persona={persona} />
              </>
            )}
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonaDetail;
