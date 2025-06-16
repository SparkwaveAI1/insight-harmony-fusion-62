
import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, FileText, Image } from 'lucide-react';
import Button from '@/components/ui-custom/Button';
import { toast } from 'sonner';
import { FileHandlingService } from '@/services/fileHandlingService';
import { ValidationService } from '@/services/validationService';

interface MessageInputProps {
  onSendMessage: (message: string, file?: File | null) => void;
  isResponding: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isResponding }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    const validation = ValidationService.validateMessageInput(inputMessage, selectedFile || undefined);
    
    if (!validation.isValid) {
      ValidationService.showValidationErrors(validation.errors);
      return;
    }

    onSendMessage(inputMessage, selectedFile);
    setInputMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const validation = FileHandlingService.validateFile(file);
      
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
      
      setSelectedFile(file);
      toast.success("File attached successfully! Click send to share with the persona.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    const iconType = FileHandlingService.getFileIcon(file);
    return iconType === 'image' 
      ? <Image className="h-4 w-4 text-green-500" />
      : <FileText className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="border-t p-4">
      <div className="flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile)}
              <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({FileHandlingService.formatFileSize(selectedFile.size)})
              </span>
            </div>
            <button 
              onClick={removeFile}
              className="ml-auto text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={selectedFile ? "Add a message with your file..." : "Type your message..."}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isResponding}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <Button
            onClick={triggerFileInput}
            disabled={isResponding}
            size="icon"
            variant="outline"
            type="button"
            title="Attach file (PDF, images, documents)"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={FileHandlingService.getAcceptedFileTypes()}
            className="hidden"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && !selectedFile) || isResponding}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Supported files: PDF, images (JPG, PNG, GIF, WEBP), text files, Office documents • Max size: 50MB
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
