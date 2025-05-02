
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Tag, Users, Trash2, Edit, Loader2 } from "lucide-react";
import { getConversationById, getConversationMessages } from "@/services/collections";
import { toast } from "sonner";
import { ConversationMessage } from "@/services/collections/types";

const ConversationDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConversation = async () => {
      setIsLoading(true);
      try {
        if (conversationId) {
          const conversationData = await getConversationById(conversationId);
          const messagesData = await getConversationMessages(conversationId);
          
          if (conversationData) {
            setConversation(conversationData);
            setMessages(messagesData);
          } else {
            toast.error("Conversation not found");
            navigate("/projects");
          }
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        toast.error("Failed to load conversation");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversation();
  }, [conversationId, navigate]);

  const formatMessageTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch (e) {
      return "Unknown time";
    }
  };

  const handleDelete = async () => {
    // Delete functionality will be implemented later
    toast.info("Delete functionality coming soon");
  };

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 pt-24">
                <div className="container py-6 flex items-center justify-center h-[60vh]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </main>
              <Footer />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!conversation) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold font-plasmik">
                      {conversation.title}
                    </h1>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" className="text-destructive" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button asChild>
                      <Link to={`/projects/${conversation.project_id}`}>Back to Project</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Conversation History</CardTitle>
                        <CardDescription>
                          {messages.length} messages in this conversation
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                          <div className="space-y-4">
                            {messages.map((message, index) => (
                              <div 
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div 
                                  className={`
                                    max-w-[80%] p-4 rounded-lg
                                    ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                                  `}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold">
                                      {message.role === 'user' ? 'You' : 'Persona'}
                                    </span>
                                    <span className="text-xs opacity-70">
                                      {formatMessageTime(message.created_at)}
                                    </span>
                                  </div>
                                  <p>{message.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Conversation Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            Date Created
                          </h3>
                          <p>
                            {format(new Date(conversation.created_at), "MMMM d, yyyy")}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                            <Users className="h-4 w-4 mr-2" />
                            Personas
                          </h3>
                          
                          {conversation.persona_ids && conversation.persona_ids.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {conversation.persona_ids.map((id: string) => (
                                <Badge key={id} variant="outline">
                                  {id}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No personas associated
                            </p>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                            <Tag className="h-4 w-4 mr-2" />
                            Tags
                          </h3>
                          
                          {conversation.tags && conversation.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {conversation.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No tags added
                            </p>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <Button asChild variant="outline" className="w-full">
                          <Link to={`/projects/${conversation.project_id}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Project
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ConversationDetail;
