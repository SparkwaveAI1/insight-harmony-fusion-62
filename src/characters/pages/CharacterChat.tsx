
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import CharacterChatInterface from '../components/CharacterChatInterface';
import { PersonaProvider } from '@/context/PersonaProvider';
import { Toaster } from 'sonner';

// Create a QueryClient for this route
const queryClient = new QueryClient();

const CharacterChat = () => {
  const { characterId } = useParams<{ characterId: string }>();

  if (!characterId) {
    return <Navigate to="/characters" replace />;
  }

  return (
    <PersonaProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-grow">
            <Section className="pt-24">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">Universal Translator</h1>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Communicate across time and language barriers with historical characters
                  </p>
                  <CharacterChatInterface characterId={characterId} />
                </div>
              </div>
            </Section>
          </main>
          <Footer />
          <Toaster />
        </div>
      </QueryClientProvider>
    </PersonaProvider>
  );
};

export default CharacterChat;
