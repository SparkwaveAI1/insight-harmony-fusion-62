
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import PersonaChatInterface from '@/components/persona-chat/PersonaChatInterface';

const PersonaChat = () => {
  const { personaId } = useParams<{ personaId: string }>();

  if (!personaId) {
    return <div>No persona ID provided</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="pt-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <PersonaChatInterface personaId={personaId} />
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonaChat;
