
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CreativeCharacterAIChatProps {
  onCompileDescription: (description: string) => void;
  onSubmitForCreation: (description: string) => void;
  onClose: () => void;
}

const CreativeCharacterAIChat = ({ 
  onCompileDescription, 
  onSubmitForCreation, 
  onClose 
}: CreativeCharacterAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm here to help you create an amazing Character Lab character. Tell me about the character you have in mind - what kind of being are they? What makes them unique or interesting?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compiledDescription, setCompiledDescription] = useState<string>('');
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('character-lab-ai-chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          action: 'brainstorm'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompileDescription = async () => {
    if (messages.length < 2) {
      toast.error('Please have a conversation first before compiling a description.');
      return;
    }

    setIsCompiling(true);

    try {
      const { data, error } = await supabase.functions.invoke('character-lab-ai-chat', {
        body: {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          action: 'compile'
        }
      });

      if (error) throw error;

      setCompiledDescription(data.response);
      onCompileDescription(data.response);
      toast.success('Character description compiled successfully!');
    } catch (error) {
      console.error('Error compiling description:', error);
      toast.error('Failed to compile description. Please try again.');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSubmitForCreation = async () => {
    if (!compiledDescription) {
      toast.error('Please compile a description first before submitting for creation.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitForCreation(compiledDescription);
    } catch (error) {
      console.error('Error submitting for creation:', error);
      toast.error('Failed to create character. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-background border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Character Lab AI Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Compiled Description Preview */}
      {compiledDescription && (
        <div className="p-4 border-t bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Compiled Description:
            </span>
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-200 bg-white dark:bg-gray-800 p-3 rounded border max-h-32 overflow-y-auto">
            {compiledDescription}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t space-y-3">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your character idea..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCompileDescription}
            disabled={isCompiling || messages.length < 2}
            className="flex-1"
          >
            {isCompiling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Compile Description
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSubmitForCreation}
            disabled={!compiledDescription || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Character
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreativeCharacterAIChat;
