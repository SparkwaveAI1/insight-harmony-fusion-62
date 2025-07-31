import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import {
  getUserCollectionsWithCount,
  getPublicCollectionsWithCount,
  createCollection,
  deleteCollection,
  Collection,
  CollectionWithPersonaCount,
  updateCollection
} from "@/services/collections/collectionsService";
import Button from "@/components/ui-custom/Button";
import { Plus, Trash2, Edit, FolderOpen, Globe, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Collections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCollections, setMyCollections] = useState<CollectionWithPersonaCount[]>([]);
  const [publicCollections, setPublicCollections] = useState<CollectionWithPersonaCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

  const fetchCollections = async () => {
    if (!user) {
      console.error("No user found when fetching collections");
      return;
    }
    
    setLoading(true);
    console.log("Fetching collections for user:", user.id);
    
    try {
      const [myData, publicData] = await Promise.all([
        getUserCollectionsWithCount(),
        getPublicCollectionsWithCount()
      ]);
      
      console.log("My collections received:", myData);
      console.log("Public collections received:", publicData);
      
      setMyCollections(myData);
      setPublicCollections(publicData);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
    
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    if (!name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    setIsCreating(true);
    try {
      const collection = await createCollection(name, description || null, isPublic);
      if (collection) {
        setCreateDialogOpen(false);
        setName("");
        setDescription("");
        setIsPublic(false); // Reset to private
        fetchCollections();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCollection = async () => {
    if (!selectedCollection || !name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateCollection(selectedCollection.id, {
        name,
        description: description || null,
        is_public: isPublic
      });

      if (result) {
        setEditDialogOpen(false);
        fetchCollections();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to collection detail
    setSelectedCollection(collection);
    setName(collection.name);
    setDescription(collection.description || "");
    setIsPublic(collection.is_public);
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

  const renderCollectionGrid = (collections: CollectionWithPersonaCount[], showActions: boolean) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted/30 animate-pulse"></div>
          ))}
        </div>
      );
    }

    if (collections.length === 0) {
      const message = activeTab === "my" 
        ? "No collections yet" 
        : "No public collections available";
      const description = activeTab === "my" 
        ? "Create your first collection to organize your personas"
        : "Check back later for public collections from other users";
      
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg">
          <div className="rounded-full bg-muted/20 p-6">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mt-6">{message}</h3>
          <p className="text-muted-foreground mt-2">{description}</p>
          {activeTab === "my" && (
            <Button 
              className="mt-6"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <div 
            key={collection.id}
            className="relative border rounded-lg p-6 hover:shadow-md transition-shadow group"
            onClick={() => viewCollection(collection.id)}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold">{collection.name}</h2>
                {collection.is_public ? (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                {collection.description || "No description"}
              </p>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-sm text-muted-foreground">
                {collection.persona_count} personas
              </p>
              {showActions && (
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
              )}
            </div>
          </div>
        ))}
      </div>
    );
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
                <h1 className="text-3xl font-bold">Collections</h1>
                <p className="text-muted-foreground mt-2">
                  Organize your personas by creating collections.
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Collection
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="my">My Collections</TabsTrigger>
                <TabsTrigger value="public">Public Collections</TabsTrigger>
              </TabsList>

              <TabsContent value="my">
                {renderCollectionGrid(myCollections, true)}
              </TabsContent>

              <TabsContent value="public">
                {renderCollectionGrid(publicCollections, false)}
              </TabsContent>
            </Tabs>

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
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="public" className="text-sm font-medium">
                        Public Collection
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Make this collection visible to other users
                      </p>
                    </div>
                    <Switch
                      id="public"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
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
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="edit-public" className="text-sm font-medium">
                        Public Collection
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Make this collection visible to other users
                      </p>
                    </div>
                    <Switch
                      id="edit-public"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCollection} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
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
                  <AlertDialogAction onClick={handleDeleteCollection} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
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
