import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MessageCircle, Menu, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui-custom/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import MessageList from '@/components/persona-chat/MessageList';
import MessageInput from '@/components/persona-chat/MessageInput';
import { sendV4Message } from '@/services/v4-persona';
import { getV4PersonaById } from '@/services/v4-persona';
import MobileDrawerMenu from '@/components/navigation/MobileDrawerMenu';
import { toast } from 'sonner';

interface PersonaChatInterfaceProps {
  personaId: string;
}

const PersonaChatInterface = ({ personaId }: PersonaChatInterfaceProps) => {
  const [activePersona, setActivePersona] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesRef = useRef<any[]>([]);
  const [isPersonaLoading, setIsPersonaLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load V4 persona directly
  useEffect(() => {
    const loadPersona = async () => {
      try {
        setIsPersonaLoading(true);
        console.log('Loading V4 persona:', personaId);
        
        const persona = await getV4PersonaById(personaId);
        if (persona) {
          setActivePersona(persona);
          console.log('V4 persona loaded:', persona.name);
        } else {
          setSessionError('V4 persona not found');
        }
      } catch (error) {
        console.error('Error loading V4 persona:', error);
        setSessionError('Failed to load V4 persona');
      } finally {
        setIsPersonaLoading(false);
      }
    };

    loadPersona();
  }, [personaId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Ensure hooks are declared before any early returns
  const handleSendMessageWithImage = useCallback(async (message: string, imageFile: File | null) => {
    if (!activePersona || isResponding) return;
    
    try {
      setIsResponding(true);
      
      // Convert image file to base64 if present
      let imageData: string | undefined;
      if (imageFile) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }
      
      // Create user message
      const userMessage = {
        role: 'user' as const,
        content: message,
        timestamp: new Date(),
        ...(imageData && { image: imageData })
      };
      
      // Add user message to UI immediately
      setMessages(prev => [...prev, userMessage]);
      
      // Send to V4/Grok system with the latest conversation (including this user message)
      const response = await sendV4Message({
        persona_id: personaId,
        user_message: message,
        conversation_history: [...messagesRef.current, userMessage].map(m => ({
          role: m.role,
          content: m.content
        }))
      });
      
      if (response.success && response.response) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: response.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
      
    } catch (error) {
      console.error('V4/Grok Chat error:', error);
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsResponding(false);
    }
  }, [activePersona, isResponding, personaId]);

  // Show error if persona loading failed
  if (sessionError) {
    return (
      <div className="space-y-4">
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            {sessionError}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => {
            setSessionError(null);
            window.location.reload();
          }}
          className="w-full"
        >
          Retry
        </Button>
      </div>
    );
  }
  
  if (isPersonaLoading || !activePersona) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">
          Loading V4 persona...
        </p>
      </div>
    );
  }
  
  // Check if persona has required data
  if (!activePersona.name) {
    return (
      <div className="space-y-4">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">
            This V4 persona appears to be incomplete. Please check the persona data.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Refresh
        </Button>
      </div>
    );
  }
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // removed duplicate handleSendMessageWithImage (moved above)



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
          {activePersona?.name || 'Chat'}
        </h3>
        
        <Link to="/dashboard">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <LayoutDashboard className="h-5 w-5" />
            <span className="sr-only">Dashboard</span>
          </Button>
        </Link>
      </div>
      
      {/* Persona badge */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
        <Avatar className="w-12 h-12 rounded-full border-2 border-primary/20">
          {activePersona.profile_image_url ? (
            <AvatarImage src={activePersona.profile_image_url} alt={activePersona.name} />
          ) : (
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
              {activePersona.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="font-medium">{activePersona.name}</p>
          
        </div>
      </div>

      
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
            personaImageUrl={activePersona.profile_image_url}
          />
        </ScrollArea>
        
        <MessageInput
          onSendMessage={handleSendMessageWithImage}
          isResponding={isResponding}
        />
      </Card>
      
      <Alert className="bg-blue-50 border-blue-200">
        <MessageCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-800 font-medium">
          Powered by V4/Grok system for authentic conversations!
        </AlertDescription>
      </Alert>
      
      {/* Mobile Navigation Drawer */}
      <MobileDrawerMenu 
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
    </div>
  );
};

export default PersonaChatInterface;
