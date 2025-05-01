
import React, { useRef, useState, useEffect } from 'react';
import { MessageCircle, Menu, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui-custom/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import MessageList from '@/components/persona-chat/MessageList';
import MessageInput from '@/components/persona-chat/MessageInput';
import ErrorDisplay from '@/components/persona-chat/ErrorDisplay';
import { usePersonaChat } from '@/components/persona-chat/usePersonaChat';
import MobileDrawerMenu from '@/components/navigation/MobileDrawerMenu';

interface PersonaChatInterfaceProps {
  personaId: string;
}

const PersonaChatInterface = ({ personaId }: PersonaChatInterfaceProps) => {
  const {
    messages,
    isResponding,
    isLoading,
    error,
    activePersona,
    handleSendMessage
  } = usePersonaChat(personaId);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Remove automatic scrolling behavior
  // The scrolling will now be controlled by the MessageList component
  // which has auto-scroll disabled by default

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
    console.log("Opening mobile menu, current state:", mobileMenuOpen);
    setMobileMenuOpen(!mobileMenuOpen);
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
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-muted">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
          {activePersona.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium">{activePersona.name}</p>
          <p className="text-xs text-muted-foreground">
            {activePersona.metadata?.occupation || ''} 
            {activePersona.metadata?.age && `, ${activePersona.metadata.age}`}
            {activePersona.metadata?.region && ` • ${activePersona.metadata.region}`}
          </p>
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
          />
        </ScrollArea>
        
        <MessageInput
          onSendMessage={handleSendMessage}
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
    </div>
  );
};

export default PersonaChatInterface;
