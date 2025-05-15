import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

import { useAuth } from "@/context/AuthContext";
import { getAllPersonas } from "@/services/persona";
import { Persona } from "@/services/persona/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/layout/ModeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { generateResponse } from "@/services/open-ai";
import { saveConversation, saveMessage } from "@/services/collections";
import { ConversationMessage } from "@/services/collections/types";
import PersonaSelector from "@/components/dual-chat/PersonaSelector";

const DualChat = () => {
  const [personaAId, setPersonaAId] = useState("");
  const [personaBId, setPersonaBId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [allPersonas, setAllPersonas] = useState<Persona[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const personas = await getAllPersonas();
        setAllPersonas(personas);
      } catch (error) {
        console.error("Error fetching personas:", error);
        toast.error("Failed to load personas.");
      }
    };

    fetchPersonas();
  }, []);

  const personaA = allPersonas.find((p) => p.persona_id === personaAId);
  const personaB = allPersonas.find((p) => p.persona_id === personaBId);

  const handleSendMessage = async () => {
    if (!personaA || !personaB) {
      toast.error("Please select two personas to start the conversation.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setIsLoading(true);
    const userMessage: ConversationMessage = {
      id: uuidv4(),
      conversation_id: conversationId || 'new',
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
      persona_id: null,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // Generate response from Persona A
      const responseA = await generateResponse(personaA, message);
      if (responseA) {
        const personaAMessage: ConversationMessage = {
          id: uuidv4(),
          conversation_id: conversationId || 'new',
          role: 'assistant',
          content: responseA,
          created_at: new Date().toISOString(),
          persona_id: personaA.persona_id,
        };
        setMessages((prevMessages) => [...prevMessages, personaAMessage]);
      }

      // Generate response from Persona B
      const responseB = await generateResponse(personaB, message);
      if (responseB) {
        const personaBMessage: ConversationMessage = {
          id: uuidv4(),
          conversation_id: conversationId || 'new',
          role: 'assistant',
          content: responseB,
          created_at: new Date().toISOString(),
          persona_id: personaB.persona_id,
        };
        setMessages((prevMessages) => [...prevMessages, personaBMessage]);
      }

      setMessage("");
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConversation = async () => {
    if (!user) {
      toast.error("You must be logged in to save a conversation.");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title for the conversation.");
      return;
    }

    setIsSaving(true);

    try {
      // Ensure personaAId and personaBId are defined
      if (!personaAId || !personaBId) {
        throw new Error("Both personas must be selected to save the conversation.");
      }

      // Create or update conversation
      const conversationData = {
        id: conversationId || uuidv4(),
        title: title,
        project_id: "default", // Replace with actual project ID if needed
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        persona_ids: [personaAId, personaBId],
        tags: tags.split(",").map((tag) => tag.trim()),
      };

      const savedConversation = await saveConversation(conversationData);
      setConversationId(savedConversation.id);

      // Save messages
      for (const msg of messages) {
        const messageData = {
          ...msg,
          conversation_id: savedConversation.id,
        };
        await saveMessage(messageData);
      }

      toast.success("Conversation saved successfully!");
      router.push("/my-projects");
    } catch (error) {
      console.error("Error saving conversation:", error);
      toast.error("Failed to save conversation.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dual Persona Chat</h1>

      {/* Persona Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="personaA">Select Persona A</Label>
          <PersonaSelector
            value={personaAId}
            onValueChange={setPersonaAId}
          />
        </div>
        <div>
          <Label htmlFor="personaB">Select Persona B</Label>
          <PersonaSelector
            value={personaBId}
            onValueChange={setPersonaBId}
          />
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">Conversation</h2>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-[400px] mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 flex items-start ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {msg.role !== "user" && (
                  <Avatar className="mr-2">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${msg.persona_id}`}
                      alt={msg.persona_id || "AI"}
                    />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 w-fit max-w-[80%] ${msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                    }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.role !== "user" && msg.persona_id && (
                    <Badge variant="secondary" className="mt-1">
                      {allPersonas.find((p) => p.persona_id === msg.persona_id)?.name || "Unknown Persona"}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center">
                <Avatar className="mr-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </Avatar>
                <Skeleton className="h-4 w-[200px]" />
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow mr-2"
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Metadata */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Save Conversation</h2>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter conversation title"
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags"
            />
          </div>
          <Button onClick={handleSaveConversation} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Conversation"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DualChat;
