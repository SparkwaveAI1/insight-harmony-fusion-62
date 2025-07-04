
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CharacterHeader from '../components/CharacterHeader';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import CharacterChatInterface from '../components/CharacterChatInterface';
import { CharacterProvider } from '@/context/CharacterProvider';
import { Toaster } from 'sonner';

// Create a QueryClient for this route
const queryClient = new QueryClient();

const CharacterChat = () => {
  const { characterId } = useParams<{ characterId: string }>();

  if (!characterId) {
    return <Navigate to="/characters" replace />;
  }

  return (
    <CharacterProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col bg-background">
          <CharacterHeader />
          <main className="flex-grow">
            <Section className="pt-24">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">Character Chat</h1>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Engage with characters from across time, space, and imagination
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
    </CharacterProvider>
  );
};

export default CharacterChat;
