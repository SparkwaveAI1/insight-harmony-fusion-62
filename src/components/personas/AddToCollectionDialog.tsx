import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Button from "@/components/ui-custom/Button";
import { Input } from "@/components/ui/input";
import { Plus, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Collection,
  getUserCollections,
  addPersonaToCollection,
  removePersonaFromCollection,
  isPersonaInCollection,
  createCollection,
} from "@/services/collections";

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaId: string;
}

const AddToCollectionDialog: React.FC<AddToCollectionDialogProps> = ({
  open,
  onOpenChange,
  personaId,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  useEffect(() => {
    // Only log and fetch when dialog actually opens
    if (open && user?.id && !authLoading) {
      console.log('Dialog opened for user:', user.id);
      fetchCollections();
    }
  }, [open, user?.id, authLoading]);

  const fetchCollections = async () => {
    console.log('fetchCollections started');
    try {
      setLoading(true);
      console.log('Calling getUserCollections...');
      const collectionsData = await getUserCollections();
      console.log('getUserCollections response:', { 
        count: collectionsData?.length, 
        collections: collectionsData 
      });
      setCollections(collectionsData);

      // Check which collections already contain this persona
      const selected = new Set<string>();
      for (const collection of collectionsData) {
        const isInCollection = await isPersonaInCollection(collection.id, personaId);
        if (isInCollection) {
          selected.add(collection.id);
        }
      }
      console.log('Selected collections:', selected);
      setSelectedCollections(selected);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      console.log('fetchCollections completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleToggleCollection = async (collectionId: string) => {
    const newSelected = new Set(selectedCollections);
    
    if (newSelected.has(collectionId)) {
      // Remove from collection
      const result = await removePersonaFromCollection(collectionId, personaId);
      if (result) {
        newSelected.delete(collectionId);
      }
    } else {
      // Add to collection
      const result = await addPersonaToCollection(collectionId, personaId);
      if (result) {
        newSelected.add(collectionId);
      }
    }
    
    setSelectedCollections(newSelected);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setCreatingCollection(true);
    const collection = await createCollection(newCollectionName);
    setCreatingCollection(false);
    
    if (collection) {
      setNewCollectionName("");
      // Add persona to the newly created collection
      const result = await addPersonaToCollection(collection.id, personaId);
      if (result) {
        // Refresh collections
        fetchCollections();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Create new collection input */}
          <div className="flex items-center gap-2 mb-6">
            <Input
              placeholder="New collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="flex-1"
            />
            <Button 
              size="sm"
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim() || creatingCollection}
              isLoading={creatingCollection}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>

          {/* Collection list */}
          {authLoading || loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-md bg-muted/30 animate-pulse"></div>
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No collections found</p>
              <p className="text-sm">Create your first collection above</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                    selectedCollections.has(collection.id)
                      ? "bg-primary/10 border-primary/30 border"
                      : "bg-muted/20 hover:bg-muted/30"
                  }`}
                  onClick={() => handleToggleCollection(collection.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{collection.name}</span>
                    {collection.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {collection.description}
                      </span>
                    )}
                  </div>
                  {selectedCollections.has(collection.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionDialog;
