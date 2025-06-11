
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
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
    
    // Get current project collection IDs for pre-selection
    const currentCollectionIds = projectCollections.map(c => c.id);
    setSelectedCollections(currentCollectionIds);
  };

  const handleAddCollections = async () => {
    setIsLoading(true);
    try {
      // Get current collection IDs
      const currentCollectionIds = projectCollections.map(c => c.id);
      
      // Find collections to add (selected but not currently in project)
      const collectionsToAdd = selectedCollections.filter(id => !currentCollectionIds.includes(id));
      
      // Find collections to remove (currently in project but not selected)
      const collectionsToRemove = currentCollectionIds.filter(id => !selectedCollections.includes(id));

      // Add new collections
      for (const collectionId of collectionsToAdd) {
        await addCollectionToProject(projectId, collectionId);
      }

      // Remove unselected collections
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Project Collections</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {allCollections.map((collection) => (
                  <div key={collection.id} className="flex items-center space-x-2">
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
                    />
                    <label
                      htmlFor={collection.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                    >
                      {collection.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCollections} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Updating...' : 'Update Collections'}
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
