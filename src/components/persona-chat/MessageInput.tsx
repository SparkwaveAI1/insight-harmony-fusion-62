
import React, { useState, useRef, useCallback } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface MessageInputProps {
  onSendMessage: (message: string, imageFile?: File | null) => void;
  isResponding: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isResponding }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inputMessage.trim() && !selectedImage) return;
    
    onSendMessage(inputMessage, selectedImage);
    setInputMessage('');
    setSelectedImage(null);
  }, [inputMessage, selectedImage, onSendMessage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image is too large. Maximum size is 5MB.");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed.");
        return;
      }
      
      setSelectedImage(file);
      toast.success("Image selected! Click send to share with the persona.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex flex-col gap-2">
        {selectedImage && (
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm truncate max-w-[150px]">{selectedImage.name}</span>
            </div>
            <button 
              onClick={removeImage}
              className="ml-auto text-xs text-muted-foreground hover:text-destructive"
            >
              Remove
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2" style={{ width: '100%' }}>
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={selectedImage ? "Add a message with your image..." : "Type your message..."}
            className="flex-1 resize-none"
            disabled={isResponding}
            rows={3}
          />
          
          <Button
            onClick={triggerFileInput}
            disabled={isResponding}
            size="icon"
            variant="outline"
            type="button"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          
          <Button
            type="submit"
            disabled={(!inputMessage.trim() && !selectedImage) || isResponding}
            size="icon"
          >
            {isResponding ? '⏳' : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
