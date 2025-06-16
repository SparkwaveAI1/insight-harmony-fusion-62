
import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ErrorDisplay from '@/components/persona-chat/ErrorDisplay';
import ChatModeSelector, { ChatMode } from '@/components/persona-chat/ChatModeSelector';
import SaveConversationModal from '@/components/persona-chat/SaveConversationModal';
import { usePersonaChat } from '@/components/persona-chat/hooks/usePersonaChat';
import MobileDrawerMenu from '@/components/navigation/MobileDrawerMenu';
import ConversationContext from '@/components/persona-chat/ConversationContext';
import MobileNavigationBar from '@/components/persona-chat/MobileNavigationBar';
import PersonaBadge from '@/components/persona-chat/PersonaBadge';
import ChatArea from '@/components/persona-chat/ChatArea';
import { toast } from 'sonner';

interface PersonaChatInterfaceProps {
  personaId: string;
}

const PersonaChatInterface = ({ personaId }: PersonaChatInterfaceProps) => {
  const [chatMode, setChatMode] = useState<ChatMode>('conversation');
  const [conversationContext, setConversationContext] = useState<string>('');
  const {
    messages,
    isResponding,
    isLoading,
    error,
    activePersona,
    handleSendMessage,
    setConversationContext: updateContextInChat
  } = usePersonaChat(personaId, chatMode);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const navigate = useNavigate();

  // Update context in usePersonaChat hook when it changes
  useEffect(() => {
    if (updateContextInChat) {
      updateContextInChat(conversationContext);
    }
  }, [conversationContext, updateContextInChat]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !activePersona) {
    return <ErrorDisplay personaId={personaId} />;
  }
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleConversationSaved = (conversationId: string, projectId: string) => {
    toast.success("Conversation saved successfully", {
      description: "Your conversation has been saved to your project.",
      action: {
        label: "Go to Project",
        onClick: () => navigate(`/projects/${projectId}`),
      },
    });
  };

  const handleContextChange = (newContext: string) => {
    setConversationContext(newContext);
    if (newContext) {
      toast.success("Conversation context updated");
    }
  };

  const handleSendMessageWithFile = (message: string, file: File | null) => {
    handleSendMessage(message, file);
  };

  // Generate a default title from the conversation content
  const generateDefaultTitle = () => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage && firstUserMessage.content.length > 0) {
      const titlePreview = firstUserMessage.content.slice(0, 30);
      return `${titlePreview}${firstUserMessage.content.length > 30 ? '...' : ''}`;
    }
    return `Chat with ${activePersona.name} - ${new Date().toLocaleDateString()}`;
  };

  return (
    <div className="space-y-4">
      <MobileNavigationBar 
        onToggleMenu={toggleMobileMenu}
        personaName={activePersona?.name}
      />
      
      <PersonaBadge 
        persona={activePersona}
        hasMessages={messages.length > 0}
        onSaveConversation={() => setSaveModalOpen(true)}
      />

      <ConversationContext 
        context={conversationContext} 
        onContextChange={handleContextChange} 
      />

      <ChatModeSelector selectedMode={chatMode} onChange={setChatMode} />
      
      <ChatArea 
        messages={messages}
        isResponding={isResponding}
        onSendMessage={handleSendMessageWithFile}
        personaImageUrl={activePersona.profile_image_url}
      />
      
      <Alert className="bg-amber-50 border-amber-200">
        <MessageCircle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-800 font-medium">
          Voice conversation feature is currently in development. Stay tuned for updates!
        </AlertDescription>
      </Alert>
      
      <MobileDrawerMenu 
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
      
      <SaveConversationModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        messages={messages.map(m => ({
          role: m.role,
          content: m.content,
          persona_id: personaId
        }))}
        personaIds={[personaId]}
        defaultTitle={generateDefaultTitle()}
        onSaved={handleConversationSaved}
      />
    </div>
  );
};

export default PersonaChatInterface;
