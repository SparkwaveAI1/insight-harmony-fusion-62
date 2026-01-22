import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Button from "@/components/ui-custom/Button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Collection,
  getAllAccessibleCollections,
  addPersonaToCollection,
  removePersonaFromCollection,
  createCollection,
  getCollectionsForPersona,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    if (!user?.id || authLoading) return; // Exit early if not ready

    try {
      setLoading(true);
      const [collectionsData, membershipIds] = await Promise.all([
        getAllAccessibleCollections(user.id),
        getCollectionsForPersona(personaId),
      ]);

      setCollections(collectionsData || []);
      setSelectedCollections(new Set(membershipIds || []));
    } catch (error) {
      console.error('Error fetching collections:', error);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading, personaId]);

  useEffect(() => {
    if (open && user?.id && !authLoading) {
      fetchCollections();
    }
  }, [open, user?.id, authLoading, personaId, fetchCollections]);

  const handleToggleCollection = async (collectionId: string) => {
    setToggleLoadingId(collectionId);
    const newSelected = new Set(selectedCollections);
    
    // Optimistic UI update
    const wasSelected = newSelected.has(collectionId);
    if (wasSelected) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
    
    try {
      let result;
      if (wasSelected) {
        // Remove from collection
        result = await removePersonaFromCollection(collectionId, personaId);
      } else {
        // Add to collection
        result = await addPersonaToCollection(collectionId, personaId);
      }
      
      // If the operation failed, revert the optimistic update
      if (!result) {
        const revertSelected = new Set(selectedCollections);
        if (wasSelected) {
          revertSelected.add(collectionId);
        } else {
          revertSelected.delete(collectionId);
        }
        setSelectedCollections(revertSelected);
      }
    } catch (error) {
      // Revert optimistic update on error
      const revertSelected = new Set(selectedCollections);
      if (wasSelected) {
        revertSelected.add(collectionId);
      } else {
        revertSelected.delete(collectionId);
      }
      setSelectedCollections(revertSelected);
    } finally {
      setToggleLoadingId(null);
    }
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

  // Filter collections based on search term
  const filteredCollections = useMemo(() => {
    if (!searchTerm.trim()) return collections;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return collections.filter(collection =>
      collection.name.toLowerCase().includes(searchLower) ||
      (collection.description?.toLowerCase().includes(searchLower))
    );
  }, [collections, searchTerm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>

        <div className="py-4 overflow-hidden">
          {/* Create new collection input */}
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="New collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="flex-1 min-w-0"
            />
            <Button
              size="sm"
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim() || creatingCollection}
              isLoading={creatingCollection}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>

          {/* Search collections */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Collection list */}
          {authLoading || loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-md bg-muted/30 animate-pulse"></div>
              ))}
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <>
                  <p className="text-muted-foreground">No collections found matching "{searchTerm}"</p>
                  <p className="text-sm">Try a different search term</p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">No collections found</p>
                  <p className="text-sm">Create your first collection above</p>
                  <div className="mt-4">
                    <Button size="sm" variant="outline" onClick={fetchCollections}>
                      Retry
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto overflow-x-hidden">
              {filteredCollections.map((collection) => {
                const isSelected = selectedCollections.has(collection.id);
                const isToggling = toggleLoadingId === collection.id;
                const isPublic = collection.is_public;
                const isOwnCollection = collection.user_id === user?.id;

                return (
                  <div
                    key={collection.id}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 border-primary/30 border"
                        : "bg-muted/20 hover:bg-muted/30"
                    } ${isToggling ? "opacity-75" : ""}`}
                    onClick={() => !isToggling && handleToggleCollection(collection.id)}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">{collection.name}</span>
                        {isPublic && !isOwnCollection && (
                          <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Shared</span>
                        )}
                      </div>
                      {collection.description && (
                        <span className="text-xs text-muted-foreground truncate block">
                          {collection.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center shrink-0">
                      {isToggling ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                      ) : isSelected ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Collection count indicator */}
          {!loading && !authLoading && collections.length > 0 && (
            <div className="text-xs text-muted-foreground mt-3 pt-3 border-t">
              {searchTerm ? (
                <span>Showing {filteredCollections.length} of {collections.length} collections</span>
              ) : (
                <span>{collections.length} collections available</span>
              )}
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
