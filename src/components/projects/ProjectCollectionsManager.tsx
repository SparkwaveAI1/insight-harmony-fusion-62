
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus, X, Search } from 'lucide-react';
import { Collection } from '@/services/collections/types';
import {
  getProjectCollections,
  addCollectionToProject,
  removeCollectionFromProject,
  getUserCollections,
} from '@/services/collections';
import { toast } from 'sonner';

interface ProjectCollectionsManagerProps {
  projectId: string;
}

const ProjectCollectionsManager: React.FC<ProjectCollectionsManagerProps> = ({ projectId }) => {
  const [projectCollections, setProjectCollections] = useState<Collection[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjectCollections();
  }, [projectId]);

  const loadProjectCollections = async () => {
    const collections = await getProjectCollections(projectId);
    setProjectCollections(collections);
  };

  const loadAllCollections = async () => {
    const collections = await getUserCollections();
    setAllCollections(collections);
    const currentCollectionIds = projectCollections.map(c => c.id);
    setSelectedCollections(currentCollectionIds);
    setSearchQuery('');
  };

  // Filter collections by search query (case-insensitive name match)
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return allCollections;
    const q = searchQuery.toLowerCase().trim();
    return allCollections.filter(c => c.name.toLowerCase().includes(q));
  }, [allCollections, searchQuery]);

  const handleAddCollections = async () => {
    setIsLoading(true);
    try {
      const currentCollectionIds = projectCollections.map(c => c.id);
      const collectionsToAdd = selectedCollections.filter(id => !currentCollectionIds.includes(id));
      const collectionsToRemove = currentCollectionIds.filter(id => !selectedCollections.includes(id));

      for (const collectionId of collectionsToAdd) {
        await addCollectionToProject(projectId, collectionId);
      }
      for (const collectionId of collectionsToRemove) {
        await removeCollectionFromProject(projectId, collectionId);
      }

      await loadProjectCollections();
      setIsDialogOpen(false);
      toast.success('Collections updated successfully');
    } catch (error) {
      console.error('Error updating collections:', error);
      toast.error('Failed to update collections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollection = async (collectionId: string) => {
    const success = await removeCollectionFromProject(projectId, collectionId);
    if (success) {
      await loadProjectCollections();
    }
  };

  const selectedCount = selectedCollections.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Linked Collections</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={loadAllCollections}>
              <Plus className="h-4 w-4 mr-2" />
              Manage Collections
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Project Collections</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>

              {/* Count row */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  {searchQuery
                    ? `${filteredCollections.length} of ${allCollections.length} collections`
                    : `${allCollections.length} collections`}
                </span>
                <span>{selectedCount} selected</span>
              </div>

              {/* Collection list */}
              <div className="max-h-72 overflow-y-auto space-y-1 border rounded-md p-2">
                {filteredCollections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No collections match "{searchQuery}"
                  </p>
                ) : (
                  filteredCollections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer"
                      onClick={() => {
                        const isSelected = selectedCollections.includes(collection.id);
                        if (isSelected) {
                          setSelectedCollections(selectedCollections.filter(id => id !== collection.id));
                        } else {
                          setSelectedCollections([...selectedCollections, collection.id]);
                        }
                      }}
                    >
                      <Checkbox
                        id={collection.id}
                        checked={selectedCollections.includes(collection.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCollections([...selectedCollections, collection.id]);
                          } else {
                            setSelectedCollections(selectedCollections.filter(id => id !== collection.id));
                          }
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                      <label
                        htmlFor={collection.id}
                        className="text-sm leading-none flex-1 cursor-pointer"
                      >
                        {collection.name}
                      </label>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddCollections} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Updating...' : `Update Collections${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {projectCollections.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {projectCollections.map((collection) => (
              <Badge key={collection.id} variant="secondary" className="flex items-center gap-1">
                {collection.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveCollection(collection.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No collections linked to this project yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCollectionsManager;
