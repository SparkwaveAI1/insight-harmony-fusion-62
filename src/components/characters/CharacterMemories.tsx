
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, FileText, Link, Download } from 'lucide-react';
import { CharacterMemory } from '@/services/characters/types/memoryTypes';
import { getCharacterMemories, deleteCharacterMemory } from '@/services/characters/characterMemoryService';
import AddMemoryDialog from './AddMemoryDialog';

interface CharacterMemoriesProps {
  characterId: string;
  isOwner: boolean;
}

const CharacterMemories = ({ characterId, isOwner }: CharacterMemoriesProps) => {
  const [memories, setMemories] = useState<CharacterMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      const data = await getCharacterMemories(characterId);
      setMemories(data);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [characterId]);

  const handleDeleteMemory = async (memoryId: string) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      const success = await deleteCharacterMemory(memoryId);
      if (success) {
        setMemories(prev => prev.filter(m => m.id !== memoryId));
      }
    }
  };

  const handleMemoryAdded = () => {
    loadMemories();
    setShowAddDialog(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Memories</h3>
        </div>
        <div className="text-center py-8">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Memories</h3>
          <p className="text-sm text-muted-foreground">
            Character knowledge base and stored information
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Memory
          </Button>
        )}
      </div>

      {memories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No memories yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building this character's knowledge base by adding memories.
              </p>
              {isOwner && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Memory
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {memories.map((memory) => (
            <Card key={memory.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{memory.title}</CardTitle>
                    <CardDescription>
                      {new Date(memory.created_at).toLocaleDateString()} • {memory.memory_type}
                    </CardDescription>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {memory.content && (
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                    {memory.content}
                  </p>
                )}
                
                {memory.file_url && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-muted rounded-lg">
                    <Link className="h-4 w-4" />
                    <span className="text-sm font-medium">Attached file</span>
                    {memory.file_size && (
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(memory.file_size)})
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={memory.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )}

                {memory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {memory.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showAddDialog && (
        <AddMemoryDialog
          characterId={characterId}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onMemoryAdded={handleMemoryAdded}
        />
      )}
    </div>
  );
};

export default CharacterMemories;
