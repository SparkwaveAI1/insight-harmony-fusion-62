
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MessageCircle } from "lucide-react";
import { getConversationById, getConversationMessages } from "@/services/collections";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPersonaByPersonaId } from "@/services/persona/personaService";

const ConversationDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadConversationData(conversationId);
    }
  }, [conversationId]);

  const loadConversationData = async (id: string) => {
    setIsLoading(true);
    try {
      // Get conversation details
      const conversationData = await getConversationById(id);
      if (conversationData) {
        setConversation(conversationData);
        
        // Get conversation messages
        const messagesData = await getConversationMessages(id);
        setMessages(messagesData);
        
        // Load persona details if there are any in the conversation
        if (conversationData.persona_ids && conversationData.persona_ids.length > 0) {
          const personaPromises = conversationData.persona_ids.map(async (personaId: string) => {
            return await getPersonaByPersonaId(personaId);
          });
          
          const personaResults = await Promise.all(personaPromises);
          setPersonas(personaResults.filter(Boolean));
        }
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const getPersonaName = (personaId: string) => {
    const persona = personas.find(p => p.persona_id === personaId);
    return persona ? persona.name : "Unknown Persona";
  };
  
  const getPersonaInitial = (personaId: string) => {
    const name = getPersonaName(personaId);
    return name ? name.charAt(0) : "?";
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="pt-24">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : !conversation ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-4">Conversation Not Found</h3>
                <p className="text-muted-foreground mb-6">
                  The conversation you're looking for doesn't exist or couldn't be loaded.
                </p>
                <Button as={Link} to="/projects">Back to Projects</Button>
              </Card>
            ) : (
              <>
                {/* Header with back button */}
                <div className="mb-6">
                  <Button variant="ghost" className="pl-0" as={Link} to={`/projects/${conversation.project_id}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Project
                  </Button>
                </div>

                {/* Conversation header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2 font-plasmik">{conversation.title}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(conversation.created_at)}
                    </span>
                    
                    {conversation.tags && conversation.tags.length > 0 && (
                      <div className="flex gap-2">
                        {conversation.tags.map((tag: string, index: number) => (
                          <span 
                            key={index} 
                            className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Personas involved */}
                  {personas.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Personas in this conversation:</p>
                      <div className="flex gap-3 flex-wrap">
                        {personas.map((persona) => (
                          <Link 
                            key={persona.persona_id} 
                            to={`/persona-detail/${persona.persona_id}`}
                            className="inline-flex items-center gap-2 p-2 rounded-md bg-accent/50 hover:bg-accent"
                          >
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                              {persona.name.charAt(0)}
                            </div>
                            <span className="text-sm">{persona.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Conversation
                  </h2>
                  
                  <div className="space-y-4 max-w-4xl">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-start gap-3 max-w-[85%]">
                          {message.role === 'assistant' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {message.persona_id ? getPersonaInitial(message.persona_id) : "AI"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div
                            className={`rounded-lg px-4 py-3 shadow ${
                              message.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            {message.role === 'assistant' && message.persona_id && (
                              <p className="text-xs font-medium mb-1">
                                {getPersonaName(message.persona_id)}
                              </p>
                            )}
                            <div className="prose prose-sm max-w-none">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-70 mt-1 text-right">
                              {formatDate(message.created_at)}
                            </div>
                          </div>
                          
                          {message.role === 'user' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-accent">You</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default ConversationDetail;
