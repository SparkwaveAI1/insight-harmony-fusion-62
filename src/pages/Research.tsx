import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, FileText, BarChart3, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { ResearchTabs } from '@/components/research/ResearchTabs';
import { useResearchSession } from '@/components/research/hooks/useResearchSession';
import UnifiedSurveyInterface from '@/components/research/UnifiedSurveyInterface';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const Research: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [activeTab, setActiveTab] = useState<'chat' | 'personas' | 'documents' | 'survey' | 'settings'>('chat');
  const [isSurveyVisible, setIsSurveyVisible] = useState(false);

  const {
    sessionId,
    loadedPersonas,
    projectDocuments,
    messages,
    isLoading,
    createSession,
    sendMessage,
    sendToPersona
  } = useResearchSession(projectId || undefined);

  const handleSendToPersona = async (personaId: string): Promise<void> => {
    try {
      const response = await sendToPersona(personaId);
      console.log('Received response from persona:', response);
      // The response is now captured and handled by the research session hook
    } catch (error) {
      console.error('Error getting persona response:', error);
      toast.error('Failed to get persona response');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Chat Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.map((message, index) => (
                <div key={index} className={`mb-2 p-3 rounded-md ${message.role === 'user' ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  <p className="font-bold">{message.role === 'user' ? 'You' : 'Persona'}</p>
                  <p>{message.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      case 'personas':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Loaded Personas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadedPersonas.map(persona => (
                <div key={persona.persona_id} className="mb-2 p-3 rounded-md bg-green-100">
                  <p className="font-bold">{persona.name}</p>
                  <p>{persona.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      case 'documents':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Project Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {projectDocuments.map(doc => (
                <div key={doc.id} className="mb-2 p-3 rounded-md bg-yellow-100">
                  <p className="font-bold">{doc.title}</p>
                  <p>{doc.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
        case 'survey':
          return (
            <UnifiedSurveyInterface
              onBack={() => setActiveTab('chat')}
            />
          );
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p>Settings content here...</p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Research Project</h1>
      
      <ResearchTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Research;
