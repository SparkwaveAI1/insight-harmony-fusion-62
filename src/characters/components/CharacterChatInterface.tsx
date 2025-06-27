
import React, { useRef, useState, useEffect } from 'react';
import { MessageCircle, Menu, LayoutDashboard, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui-custom/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import MessageList from '@/components/persona-chat/MessageList';
import MessageInput from '@/components/persona-chat/MessageInput';
import ErrorDisplay from '@/components/persona-chat/ErrorDisplay';
import ChatModeSelector, { ChatMode } from '@/components/persona-chat/ChatModeSelector';
import SaveConversationModal from '@/components/persona-chat/SaveConversationModal';
import { useCharacterChat } from '../hooks/useCharacterChat';
import MobileDrawerMenu from '@/components/navigation/MobileDrawerMenu';
import ConversationContext from '@/components/persona-chat/ConversationContext';
import { toast } from 'sonner';

interface CharacterChatInterfaceProps {
  characterId: string;
}

const CharacterChatInterface = ({ characterId }: CharacterChatInterfaceProps) => {
  const [chatMode, setChatMode] = useState<ChatMode>('conversation');
  const [conversationContext, setConversationContext] = useState<string>('');
  const {
    messages,
    isResponding,
    isLoading,
    error,
    activeCharacter,
    handleSendMessage,
    setConversationContext: updateConversationContext
  } = useCharacterChat(characterId, chatMode);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !activeCharacter) {
    return <ErrorDisplay personaId={characterId} />;
  }
  
  const toggleMobileMenu = () => {
    console.log("Opening mobile menu, current state:", mobileMenuOpen);
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
    updateConversationContext(newContext);
    if (newContext) {
      toast.success("Conversation context updated");
    }
  };

  const handleSendMessageWithImage = async (message: string, imageFile: File | null) => {
    await handleSendMessage(message, imageFile);
  };

  const generateDefaultTitle = () => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage && firstUserMessage.content.length > 0) {
      const titlePreview = firstUserMessage.content.slice(0, 30);
      return `${titlePreview}${firstUserMessage.content.length > 30 ? '...' : ''}`;
    }
    
    return `Chat with ${activeCharacter.name} - ${new Date().toLocaleDateString()}`;
  };

  return (
    <div className="space-y-4">
      {/* Mobile Navigation Bar */}
      <div className="flex items-center justify-between md:hidden mb-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleMobileMenu}
          className="h-10 w-10"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        
        <h3 className="font-medium">
          {activeCharacter?.name || 'Chat'}
        </h3>
        
        <Link to="/dashboard">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <LayoutDashboard className="h-5 w-5" />
            <span className="sr-only">Dashboard</span>
          </Button>
        </Link>
      </div>
      
      {/* Character badge */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
        <Avatar className="w-12 h-12 rounded-full border-2 border-primary/20">
          {activeCharacter.profile_image_url ? (
            <AvatarImage src={activeCharacter.profile_image_url} alt={activeCharacter.name} />
          ) : (
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
              {activeCharacter.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="font-medium">{activeCharacter.name}</p>
          <p className="text-xs text-muted-foreground">
            {activeCharacter.metadata?.occupation || ''} 
            {activeCharacter.metadata?.age && `, ${activeCharacter.metadata.age}`}
            {activeCharacter.metadata?.region && ` • ${activeCharacter.metadata.region}`}
          </p>
        </div>
        
        {/* Save Conversation Button */}
        {messages.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={() => setSaveModalOpen(true)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        )}
      </div>

      {/* Conversation Context */}
      <ConversationContext 
        context={conversationContext} 
        onContextChange={handleContextChange} 
      />

      {/* Chat Mode Selector */}
      <ChatModeSelector selectedMode={chatMode} onChange={setChatMode} />
      
      {/* Card with scroll area and message input */}
      <Card className="h-[600px] flex flex-col">
        <ScrollArea 
          ref={scrollAreaRef} 
          className="flex-1 h-[520px]"
        >
          <MessageList 
            messages={messages} 
            isResponding={isResponding} 
            messagesEndRef={messagesEndRef}
            disableAutoScroll={true}
            personaImageUrl={activeCharacter.profile_image_url}
          />
        </ScrollArea>
        
        <MessageInput
          onSendMessage={handleSendMessageWithImage}
          isResponding={isResponding}
        />
      </Card>
      
      <Alert className="bg-amber-50 border-amber-200">
        <MessageCircle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-800 font-medium">
          Voice conversation feature is currently in development. Stay tuned for updates!
        </AlertDescription>
      </Alert>
      
      {/* Mobile Navigation Drawer */}
      <MobileDrawerMenu 
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
      
      {/* Save Conversation Modal */}
      <SaveConversationModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        messages={messages.map(m => ({
          role: m.role,
          content: m.content,
          persona_id: characterId
        }))}
        personaIds={[characterId]}
        defaultTitle={generateDefaultTitle()}
        onSaved={handleConversationSaved}
      />
    </div>
  );
};

export default CharacterChatInterface;
