
import React from 'react';
import Card from '@/components/ui-custom/Card';
import PersonaSelector from '@/components/dual-chat/PersonaSelector';
import PersonaDisplay from '@/components/dual-chat/PersonaDisplay';
import ChatMessages from '@/components/dual-chat/ChatMessages';
import ChatInput from '@/components/dual-chat/ChatInput';
import ChatControls from '@/components/dual-chat/ChatControls';
import useDualChat from '@/components/dual-chat/useDualChat';

const DualChat: React.FC = () => {
  const {
    personaAId,
    personaBId,
    messages,
    userInput,
    targetPersona,
    autoChatActive,
    exchangeCount,
    isResponding,
    maxExchanges,
    isLoading,
    activePersonas,
    messagesEndRef,
    setPersonaAId,
    setPersonaBId,
    setUserInput,
    setTargetPersona,
    handleLoadPersonas,
    handleStartConversation,
    handleStopConversation,
    handleUserSendMessage,
    getPersonaA,
    getPersonaB,
    getPersonaName,
  } = useDualChat();

  const activePersonasLoaded = activePersonas.length === 2;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dual Persona Chat</h1>
        
        <PersonaSelector
          personaAId={personaAId}
          personaBId={personaBId}
          setPersonaAId={setPersonaAId}
          setPersonaBId={setPersonaBId}
          handleLoadPersonas={handleLoadPersonas}
          autoChatActive={autoChatActive}
          isLoading={isLoading}
        />
        
        {activePersonasLoaded && (
          <PersonaDisplay
            personaA={getPersonaA()}
            personaB={getPersonaB()}
            personaAId={personaAId}
            personaBId={personaBId}
          />
        )}
        
        <Card className="h-[600px] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Conversation
              {autoChatActive && <span className="ml-2 text-sm font-normal text-primary">(Conversation in Progress...)</span>}
            </h2>
            <ChatControls
              handleStartConversation={handleStartConversation}
              handleStopConversation={handleStopConversation}
              autoChatActive={autoChatActive}
              isResponding={isResponding}
              activePersonasLoaded={activePersonasLoaded}
            />
          </div>
          
          <ChatMessages
            messages={messages}
            isResponding={isResponding}
            getPersonaName={getPersonaName}
            messagesEndRef={messagesEndRef}
          />
          
          <ChatInput
            userInput={userInput}
            setUserInput={setUserInput}
            targetPersona={targetPersona}
            setTargetPersona={setTargetPersona}
            handleUserSendMessage={handleUserSendMessage}
            isResponding={isResponding}
            getPersonaName={getPersonaName}
            activePersonasLoaded={activePersonasLoaded}
            exchangeCount={exchangeCount}
            maxExchanges={maxExchanges}
          />
        </Card>
      </div>
    </div>
  );
};

export default DualChat;
