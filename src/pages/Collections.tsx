
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
import { Plus, Trash2, Edit, FolderOpen, Loader2 } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    console.log("=== COLLECTIONS PAGE DEBUG ===");
    console.log("Collections useEffect triggered");
    console.log("User:", user);
    console.log("User ID:", user?.id);
    console.log("User email:", user?.email);
    
    const fetchCollections = async () => {
      console.log("=== STARTING COLLECTIONS FETCH ===");
      setLoading(true);
      setError(null);
      
      try {
        console.log("Calling getUserCollectionsWithCount...");
        const data = await getUserCollectionsWithCount();
        console.log("Collections fetch response:", data);
        console.log("Collections count:", data?.length || 0);
        
        if (Array.isArray(data)) {
          setCollections(data);
          console.log("Collections set successfully:", data.length, "items");
        } else {
          console.warn("Collections data is not an array:", data);
          setCollections([]);
        }
      } catch (error) {
        console.error("=== COLLECTIONS FETCH ERROR ===");
        console.error("Error details:", error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        
        setError(error instanceof Error ? error.message : "Failed to load collections");
        toast.error("Failed to load collections: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setLoading(false);
        console.log("=== COLLECTIONS FETCH COMPLETE ===");
        console.log("Final loading state:", false);
      }
    };

    if (user?.id) {
      console.log("User exists with ID, fetching collections...");
      fetchCollections();
    } else if (user === null) {
      console.log("No user found (user is null), redirecting to sign-in");
      navigate('/sign-in');
    } else {
      console.log("User is still loading (undefined), waiting...");
      setLoading(false);
    }
  }, [user, navigate]);

  const handleCreateCollection = async () => {
    if (!name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      const collection = await createCollection(name, description || null);
      if (collection) {
        setCreateDialogOpen(false);
        setName("");
        setDescription("");
        await fetchCollections();
        toast.success("Collection created successfully");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection");
    }
  };

  const handleUpdateCollection = async () => {
    if (!selectedCollection || !name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      const result = await updateCollection(selectedCollection.id, {
        name,
        description: description || null
      });

      if (result) {
        setEditDialogOpen(false);
        await fetchCollections();
        toast.success("Collection updated successfully");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Failed to update collection");
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    try {
      const result = await deleteCollection(selectedCollection.id);
      if (result) {
        toast.success(`Collection "${selectedCollection.name}" deleted`);
        setDeleteDialogOpen(false);
        await fetchCollections();
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
    }
  };

  const openEditDialog = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCollection(collection);
    setName(collection.name);
    setDescription(collection.description || "");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  const fetchCollections = async () => {
    console.log("fetchCollections called");
    setLoading(true);
    try {
      const data = await getUserCollectionsWithCount();
      console.log("Collections data in fetchCollections:", data);
      setCollections(data || []);
    } catch (error) {
      console.error("Error in fetchCollections:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch collections");
    } finally {
      setLoading(false);
    }
  };

  const viewCollection = (collectionId: string) => {
    navigate(`/collections/${collectionId}`);
  };

  console.log("=== COLLECTIONS RENDER STATE ===");
  console.log("Rendering Collections component");
  console.log("Loading:", loading);
  console.log("Error:", error);
  console.log("Collections count:", collections?.length || 0);
  console.log("User state:", user ? "logged in" : "not logged in");

  // Show error state
  if (error) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <Header />
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 p-6 flex flex-col mt-16">
              <div className="flex flex-col items-center justify-center py-20">
                <h1 className="text-2xl font-bold mb-4">Error Loading Collections</h1>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

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
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p>Loading collections...</p>
                </div>
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
                    className="relative border rounded-lg p-6 hover:shadow-md transition-shadow group cursor-pointer"
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
