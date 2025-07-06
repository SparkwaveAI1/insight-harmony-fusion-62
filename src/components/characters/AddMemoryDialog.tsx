
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { createCharacterMemory } from '@/services/characters/characterMemoryService';

interface AddMemoryDialogProps {
  characterId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemoryAdded: () => void;
}

const AddMemoryDialog = ({ characterId, open, onOpenChange, onMemoryAdded }: AddMemoryDialogProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [memoryType, setMemoryType] = useState('note');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const memoryData = {
        character_id: characterId,
        title: title.trim(),
        content: content.trim() || undefined,
        memory_type: memoryType,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        file: file || undefined,
      };

      const result = await createCharacterMemory(memoryData);
      
      if (result) {
        // Reset form
        setTitle('');
        setContent('');
        setMemoryType('note');
        setTags('');
        setFile(null);
        
        onMemoryAdded();
      }
    } catch (error) {
      console.error('Error creating memory:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Memory</DialogTitle>
          <DialogDescription>
            Add a new memory to this character's knowledge base.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Memory title..."
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="memory-type">Type</Label>
            <Select value={memoryType} onValueChange={setMemoryType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="fact">Fact</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="relationship">Relationship</SelectItem>
                <SelectItem value="skill">Skill</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the memory or add notes..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags..."
            />
          </div>

          <div className="grid gap-2">
            <Label>File Attachment</Label>
            {file ? (
              <div className="flex items-center gap-2 p-2 border rounded-lg">
                <span className="text-sm flex-1">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".txt,.pdf,.doc,.docx,.md"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Upload className="h-6 w-6" />
                  <span>Click to upload a file</span>
                  <span className="text-xs">PDF, DOC, TXT, MD (max 5MB)</span>
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Memory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemoryDialog;
