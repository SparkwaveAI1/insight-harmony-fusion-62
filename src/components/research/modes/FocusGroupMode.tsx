
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, User, MessageSquare } from 'lucide-react';
import { getAllPersonas } from '@/services/persona';
import { Persona } from '@/services/persona/types';
import { useResearchSession } from '@/components/research/hooks/useResearchSession';
import MessageList from '@/components/persona-chat/MessageList';
import MessageInput from '@/components/persona-chat/MessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FocusGroupModeProps {
  onBack: () => void;
}

const FocusGroupMode: React.FC<FocusGroupModeProps> = ({ onBack }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const {
    messages,
    isLoading: isSessionLoading,
    sendMessage,
    sendToPersona
  } = useResearchSession();

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const allPersonas = await getAllPersonas();
        setPersonas(allPersonas);
      } catch (error) {
        console.error('Error loading personas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, []);

  const togglePersonaSelection = (persona: Persona) => {
    setSelectedPersonas(prev => {
      const isSelected = prev.some(p => p.persona_id === persona.persona_id);
      if (isSelected) {
        return prev.filter(p => p.persona_id !== persona.persona_id);
      } else if (prev.length < 6) { // Limit to 6 personas for manageable focus groups
        return [...prev, persona];
      }
      return prev;
    });
  };

  const startFocusGroup = () => {
    if (selectedPersonas.length >= 2) {
      setIsSelectionMode(false);
    }
  };

  const handleSendToAll = async (message: string) => {
    for (const persona of selectedPersonas) {
      try {
        await sendToPersona(persona.persona_id);
      } catch (error) {
        console.error('Error sending to persona:', persona.name, error);
      }
    }
  };

  const handleSendToSpecific = async (message: string, personaId: string) => {
    try {
      await sendToPersona(personaId);
    } catch (error) {
      console.error('Error sending to specific persona:', error);
    }
  };

  if (!isSelectionMode) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setIsSelectionMode(true)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Change Group
          </Button>
          <h2 className="text-2xl font-bold mb-2">Focus Group Session</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedPersonas.map((persona) => (
              <Badge key={persona.persona_id} variant="secondary">
                {persona.name}
              </Badge>
            ))}
          </div>
        </div>

        <Card className="h-[600px] flex flex-col">
          <ScrollArea className="flex-1 h-[520px]">
            <MessageList 
              messages={messages} 
              isResponding={isSessionLoading}
              messagesEndRef={React.createRef()}
              disableAutoScroll={false}
            />
          </ScrollArea>
          
          <MessageInput
            onSendMessage={(message) => handleSendToAll(message)}
            isResponding={isSessionLoading}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Research Modes
        </Button>
        <h2 className="text-2xl font-bold mb-2">Focus Group Setup</h2>
        <p className="text-muted-foreground">Select 2-6 personas for your focus group discussion</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-medium">Selected: {selectedPersonas.length}/6</span>
          </div>
          {selectedPersonas.length >= 2 && (
            <Button onClick={startFocusGroup}>
              Start Focus Group
              <MessageSquare className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
        
        {selectedPersonas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedPersonas.map((persona) => (
              <Badge key={persona.persona_id} variant="default">
                {persona.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((persona) => {
            const isSelected = selectedPersonas.some(p => p.persona_id === persona.persona_id);
            return (
              <Card 
                key={persona.persona_id} 
                className={`hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => togglePersonaSelection(persona)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {persona.profile_image_url ? (
                      <img 
                        src={persona.profile_image_url} 
                        alt={persona.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {persona.metadata?.occupation || 'Persona'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {persona.description || 'Ready for focus group participation'}
                  </p>
                  {isSelected && (
                    <Badge className="mt-2" variant="default">Selected</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FocusGroupMode;
