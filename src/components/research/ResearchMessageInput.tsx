
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';

interface ResearchMessageInputProps {
  onSendMessage: (message: string, imageFile?: File | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ResearchMessageInput: React.FC<ResearchMessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() && !attachedFile) return;
    
    onSendMessage(message, attachedFile);
    setMessage('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Check file type - expanded to include more research document types
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 
        'text/plain', 'text/csv',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('File type not supported. Please use images, PDFs, text files, or Office documents.');
        return;
      }
      
      setAttachedFile(file);
      toast.success('File attached successfully');
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      {/* File attachment preview */}
      {attachedFile && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          {getFileIcon(attachedFile)}
          <div className="flex-1">
            <span className="text-sm font-medium">{attachedFile.name}</span>
            <div className="text-xs text-muted-foreground">
              {(attachedFile.size / 1024 / 1024).toFixed(2)} MB • {attachedFile.type}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Message input with enhanced layout */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[80px] pr-12 resize-none text-base"
            rows={3}
          />
          
          {/* File attachment button - more prominent */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="absolute right-2 bottom-2 h-8 w-8 p-0 hover:bg-primary/10"
            title="Attach reference documents (PDF, images, text files)"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !attachedFile)}
          size="lg"
          className="self-end h-[80px] px-6"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Helper text */}
      <div className="text-xs text-muted-foreground">
        Attach reference docs (PDFs, images, Office files) to provide context • Press Enter to send, Shift+Enter for new line
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
