
import React, { useRef, useState, useEffect } from 'react';
import { MessageCircle, Menu, LayoutDashboard, Save, Languages, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui-custom/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import MessageList from '@/components/persona-chat/MessageList';
import MessageInput from '@/components/persona-chat/MessageInput';
import ErrorDisplay from '@/components/persona-chat/ErrorDisplay';
import CharacterChatModeSelector from './CharacterChatModeSelector';
import SaveConversationModal from '@/components/persona-chat/SaveConversationModal';
import { useCharacterChat } from '../hooks/useCharacterChat';
import MobileDrawerMenu from '@/components/navigation/MobileDrawerMenu';
import ConversationContext from '@/components/persona-chat/ConversationContext';
import { ChatMode } from '../types/chatTypes';
import { toast } from 'sonner';

interface CharacterChatInterfaceProps {
  characterId: string;
}

const CharacterChatInterface = ({ characterId }: CharacterChatInterfaceProps) => {
  const [chatMode, setChatMode] = useState<ChatMode>('conversation');
  const [conversationContext, setConversationContext] = useState<string>('');
  const [showIntro, setShowIntro] = useState(true);
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

  // Auto-hide intro after 5 seconds or when first message is sent
  useEffect(() => {
    if (messages.length > 0 && showIntro) {
      setShowIntro(false);
    }
  }, [messages.length, showIntro]);

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 8000); // 8 seconds
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

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

  // Generate a default title from the conversation content
  const generateDefaultTitle = () => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage && firstUserMessage.content.length > 0) {
      const titlePreview = firstUserMessage.content.slice(0, 30);
      return `${titlePreview}${firstUserMessage.content.length > 30 ? '...' : ''}`;
    }
    
    return `Chat with ${activeCharacter.name} - ${new Date().toLocaleDateString()}`;
  };

  return (
    <TooltipProvider>
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

        {/* Universal Translator Intro */}
        {showIntro && (
          <Alert className="bg-blue-50 border-blue-200 animate-in fade-in-0 slide-in-from-top-2">
            <Languages className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-800 font-medium">
              Universal Translator enabled - communicate across time and language barriers
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-auto p-0 text-blue-600 hover:text-blue-800"
                onClick={() => setShowIntro(false)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Character badge with Universal Translator indicator */}
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">{activeCharacter.name}</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                    <Languages className="h-3 w-3 mr-1" />
                    Universal Translator
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    The Universal Translator allows you to communicate with {activeCharacter.name} 
                    across time and language barriers. They can understand your words but remain 
                    grounded in their historical time period of {activeCharacter.metadata?.historical_period || '1723'}.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-xs text-muted-foreground">
              {activeCharacter.metadata?.occupation || ''} 
              {activeCharacter.metadata?.age && `, ${activeCharacter.metadata.age}`}
              {activeCharacter.metadata?.region && ` • ${activeCharacter.metadata.region}`}
              {activeCharacter.metadata?.historical_period && ` • ${activeCharacter.metadata.historical_period}`}
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
        <CharacterChatModeSelector selectedMode={chatMode} onChange={setChatMode} />
        
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
    </TooltipProvider>
  );
};

export default CharacterChatInterface;
