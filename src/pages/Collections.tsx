import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import {
  getUserCollectionsWithCount,
  createCollection,
  deleteCollection,
  Collection,
  CollectionWithPersonaCount,
  updateCollection
} from "@/services/collections/collectionsService";
import Button from "@/components/ui-custom/Button";
import { Plus, Trash2, Edit, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Collections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<CollectionWithPersonaCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

  const fetchCollections = async () => {
    setLoading(true);
    const data = await getUserCollectionsWithCount();
    setCollections(data);
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    if (!name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    const collection = await createCollection(name, description || null);
    if (collection) {
      setCreateDialogOpen(false);
      setName("");
      setDescription("");
      fetchCollections();
    }
  };

  const handleUpdateCollection = async () => {
    if (!selectedCollection || !name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    const result = await updateCollection(selectedCollection.id, {
      name,
      description: description || null
    });

    if (result) {
      setEditDialogOpen(false);
      fetchCollections();
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    try {
      const result = await deleteCollection(selectedCollection.id);
      if (result) {
        toast.success(`Collection "${selectedCollection.name}" deleted`);
        setDeleteDialogOpen(false);
        fetchCollections();
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
    }
  };

  const openEditDialog = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to collection detail
    setSelectedCollection(collection);
    setName(collection.name);
    setDescription(collection.description || "");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to collection detail
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  // IMPORTANT CHANGE: Update the navigation to use '/collections/' instead of '/collection/'
  const viewCollection = (collectionId: string) => {
    navigate(`/collections/${collectionId}`);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <Header />
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-6 flex flex-col mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Your Collections</h1>
                <p className="text-muted-foreground mt-2">
                  Organize your personas by creating collections.
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Collection
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-lg bg-muted/30 animate-pulse"></div>
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg">
                <div className="rounded-full bg-muted/20 p-6">
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mt-6">No collections yet</h3>
                <p className="text-muted-foreground mt-2">
                  Create your first collection to organize your personas
                </p>
                <Button 
                  className="mt-6"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Collection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <div 
                    key={collection.id}
                    className="relative border rounded-lg p-6 hover:shadow-md transition-shadow group"
                    onClick={() => viewCollection(collection.id)}
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold">{collection.name}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                        {collection.description || "No description"}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-muted-foreground">
                        {collection.persona_count} personas
                      </p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => openEditDialog(collection, e)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => openDeleteDialog(collection, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Collection Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Collection</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Collection"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description (optional)
                    </label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your collection..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Collection Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Collection</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="edit-name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="edit-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="edit-description" className="text-sm font-medium">
                      Description (optional)
                    </label>
                    <Textarea
                      id="edit-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCollection}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Collection Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{selectedCollection?.name}"? This action cannot
                    be undone and all persona references will be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteCollection}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Collections;
