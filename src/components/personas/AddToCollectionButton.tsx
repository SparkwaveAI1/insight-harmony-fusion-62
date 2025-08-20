import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { getUserCollections, createCollection, addPersonaToCollection, isPersonaInCollection } from '@/services/collections';
import { Collection } from '@/services/collections/types';
import { useToast } from '@/hooks/use-toast';

interface AddToCollectionButtonProps {
  personaId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const AddToCollectionButton: React.FC<AddToCollectionButtonProps> = ({ 
  personaId, 
  variant = "outline",
  size = "default" 
}) => {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [personaInCollections, setPersonaInCollections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCollections = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userCollections = await getUserCollections();
      setCollections(userCollections);
      
      // Check which collections already contain this persona
      const existingCollections = new Set<string>();
      await Promise.all(
        userCollections.map(async (collection) => {
          const isInCollection = await isPersonaInCollection(collection.id, personaId);
          if (isInCollection) {
            existingCollections.add(collection.id);
          }
        })
      );
      setPersonaInCollections(existingCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchCollections();
      setSelectedCollections(new Set());
      setNewCollectionName('');
      setIsCreatingNew(false);
    }
  };

  const handleCollectionToggle = (collectionId: string, isChecked: boolean) => {
    const newSelected = new Set(selectedCollections);
    if (isChecked) {
      newSelected.add(collectionId);
    } else {
      newSelected.delete(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const handleCreateNewCollection = async () => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a collection name",
        variant: "destructive"
      });
      return;
    }

    try {
      const newCollection = await createCollection(newCollectionName.trim());
      if (newCollection) {
        setCollections(prev => [newCollection, ...prev]);
        setSelectedCollections(prev => new Set([...prev, newCollection.id]));
        setNewCollectionName('');
        setIsCreatingNew(false);
        toast({
          title: "Success",
          description: "Collection created successfully"
        });
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (selectedCollections.size === 0) {
      setOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const promises = Array.from(selectedCollections).map(async (collectionId) => {
        // Only add if not already in collection
        if (!personaInCollections.has(collectionId)) {
          return addPersonaToCollection(collectionId, personaId);
        }
        return true;
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;

      if (successCount > 0) {
        toast({
          title: "Success",
          description: `Persona added to ${successCount} collection${successCount !== 1 ? 's' : ''}`
        });
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error adding to collections:', error);
      toast({
        title: "Error",
        description: "Failed to add persona to collections",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={() => setOpen(true)}
      >
        <FolderPlus className="h-4 w-4 mr-2" />
        Add to Collection
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Choose collections to add this persona to, or create a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create new collection section */}
            <div className="space-y-2">
              <Label>Create new collection</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  disabled={isSaving}
                />
                <Button 
                  onClick={handleCreateNewCollection}
                  disabled={!newCollectionName.trim() || isSaving}
                  size="sm"
                >
                  Create
                </Button>
              </div>
            </div>

            {/* Existing collections */}
            <div className="space-y-2">
              <Label>Existing collections</Label>
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading collections...</div>
              ) : collections.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No collections found. Create your first one above.
                </div>
              ) : (
                <ScrollArea className="h-48 w-full rounded border p-3">
                  <div className="space-y-3">
                    {collections.map((collection) => {
                      const isInCollection = personaInCollections.has(collection.id);
                      const isSelected = selectedCollections.has(collection.id);
                      
                      return (
                        <div key={collection.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`collection-${collection.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleCollectionToggle(collection.id, !!checked)
                            }
                            disabled={isInCollection || isSaving}
                          />
                          <div className="flex-1">
                            <Label 
                              htmlFor={`collection-${collection.id}`}
                              className={`cursor-pointer ${
                                isInCollection ? 'text-muted-foreground' : ''
                              }`}
                            >
                              {collection.name}
                              {isInCollection && (
                                <span className="ml-2 text-xs">(already added)</span>
                              )}
                            </Label>
                            {collection.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {collection.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={selectedCollections.size === 0 || isSaving}
            >
              {isSaving ? 'Adding...' : `Add to ${selectedCollections.size} Collection${selectedCollections.size !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToCollectionButton;
