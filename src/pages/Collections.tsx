import React, { useState, useEffect, useDeferredValue, useCallback, useMemo } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import {
  createCollection,
  deleteCollection,
  Collection,
  CollectionWithPersonaCount,
  updateCollection
} from "@/services/collections/collectionsService";
import { useCursorFeed } from "@/hooks/useCursorFeed";
import { supabase } from "@/integrations/supabase/client";
import Button from "@/components/ui-custom/Button";
import { Plus, Trash2, Edit, FolderOpen, Search, Grid, List, Globe, Lock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getBearerAndBase, retryFetch } from "@/utils/supabase-helpers";

const Collections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-collections');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  // Use deferred value for search to prevent excessive re-renders
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Fetch function for cursor-based pagination
  const fetchCollectionsPage = useCallback(async (cursor?: string) => {
    const { token, base } = await getBearerAndBase(supabase);
    const params = new URLSearchParams();
    params.set('type', activeTab === 'my-collections' ? 'user' : 'public');
    if (cursor) params.set('cursor', cursor);

    const res = await retryFetch(`${base}/functions/v1/collections-list?${params.toString()}`, {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`collections-list failed: ${res.status} ${errText}`);
    }

    const payload = await res.json();
    return { data: payload.data || [], next_cursor: payload.next_cursor };
  }, [activeTab]);

  // Separate pagination feeds for each tab
  const myCollectionsFeed = useCursorFeed<CollectionWithPersonaCount>(
    useCallback(async (cursor?: string) => {
      const { token, base } = await getBearerAndBase(supabase);
      const params = new URLSearchParams();
      params.set('type', 'user');
      if (cursor) params.set('cursor', cursor);
      const res = await retryFetch(`${base}/functions/v1/collections-list?${params.toString()}` , {
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`collections-list failed: ${res.status}`);
      const payload = await res.json();
      return { data: payload.data || [], next_cursor: payload.next_cursor };
    }, [])
  );

  const publicCollectionsFeed = useCursorFeed<CollectionWithPersonaCount>(
    useCallback(async (cursor?: string) => {
      const { token, base } = await getBearerAndBase(supabase);
      const params = new URLSearchParams();
      params.set('type', 'public');
      if (cursor) params.set('cursor', cursor);
      const res = await retryFetch(`${base}/functions/v1/collections-list?${params.toString()}` , {
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`collections-list failed: ${res.status}`);
      const payload = await res.json();
      return { data: payload.data || [], next_cursor: payload.next_cursor };
    }, [])
  );

  const currentFeed = activeTab === 'my-collections' ? myCollectionsFeed : publicCollectionsFeed;

  // Filter collections based on search query
  const filteredCollections = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return currentFeed.items;
    }
    return currentFeed.items.filter(collection =>
      collection.name.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
      (collection.description && collection.description.toLowerCase().includes(deferredSearchQuery.toLowerCase()))
    );
  }, [currentFeed.items, deferredSearchQuery]);

  // Initial load
  useEffect(() => {
    if (user) {
      myCollectionsFeed.reset();
      publicCollectionsFeed.reset();
    }
  }, [user, myCollectionsFeed.reset, publicCollectionsFeed.reset]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

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
        setIsPublic(false);
        // Refresh the appropriate feed
        if (isPublic) {
          publicCollectionsFeed.reset();
        }
        myCollectionsFeed.reset();
        toast.success(`Collection "${name}" created successfully`);
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
        // Refresh both feeds since visibility might have changed
        myCollectionsFeed.reset();
        publicCollectionsFeed.reset();
        toast.success(`Collection "${name}" updated successfully`);
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
        // Refresh both feeds
        myCollectionsFeed.reset();
        publicCollectionsFeed.reset();
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
    setIsPublic(collection.is_public || false);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to collection detail
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  const viewCollection = (collectionId: string) => {
    navigate(`/collections/${collectionId}`);
  };


  function renderCollectionsContent() {
    return (
      <>
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
            {deferredSearchQuery !== searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {currentFeed.items.length === 0 && !currentFeed.hasMore ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-muted/30 animate-pulse"></div>
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg">
            <div className="rounded-full bg-muted/20 p-6">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            {searchQuery.trim() ? (
              <>
                <h3 className="font-medium text-lg mt-6">No collections found</h3>
                <p className="text-muted-foreground mt-2">
                  No collections match your search for "{searchQuery}"
                </p>
              </>
            ) : (
              <>
                <h3 className="font-medium text-lg mt-6">
                  {activeTab === 'my-collections' ? 'No collections yet' : 'No public collections available'}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {activeTab === 'my-collections' 
                    ? 'Create your first collection to organize your personas'
                    : 'No public collections have been shared by the community yet'
                  }
                </p>
                {activeTab === 'my-collections' && (
                  <Button 
                    className="mt-6"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Collection
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredCollections.map((collection) => {
              const isOwner = activeTab === 'my-collections';
              
              return (
                <div 
                  key={collection.id}
                  className={`relative border rounded-lg p-6 hover:shadow-md transition-shadow group cursor-pointer ${
                    viewMode === 'list' ? 'flex items-center space-x-4' : ''
                  }`}
                  onClick={() => viewCollection(collection.id)}
                >
                  {viewMode === 'grid' ? (
                    <div className="flex flex-col h-full min-h-[200px]">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h2 className="text-xl font-semibold line-clamp-3 leading-normal mb-2">{collection.name}</h2>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {collection.is_public ? (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {collection.description || "No description"}
                        </p>
                      </div>
                      <div className="flex justify-between items-end pt-4 mt-auto">
                        <p className="text-sm text-muted-foreground">
                          {collection.persona_count} personas
                        </p>
                        {isOwner && (
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
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h2 className="text-xl font-semibold">{collection.name}</h2>
                          {collection.is_public ? (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {collection.description || "No description"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {collection.persona_count} personas
                        </p>
                      </div>
                      {isOwner && (
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
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredCollections.length > 0 && currentFeed.hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => currentFeed.loadMore()}
              variant="outline"
              disabled={!currentFeed.hasMore}
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Load More
            </Button>
          </div>
        )}
      </>
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
                <h1 className="text-3xl font-bold">Collections</h1>
                <p className="text-muted-foreground mt-2">
                  Organize your personas and discover public collections from the community.
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Collection
              </Button>
            </div>

            {/* Tabs for My Collections vs Public Collections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="my-collections" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  My Collections
                  <Badge variant="secondary" className="ml-1">
                    {myCollectionsFeed.items.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="public-collections" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public Collections
                  <Badge variant="secondary" className="ml-1">
                    {publicCollectionsFeed.items.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-collections" className="mt-0">
                {renderCollectionsContent()}
              </TabsContent>
              
              <TabsContent value="public-collections" className="mt-0">
                {renderCollectionsContent()}
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

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
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <label htmlFor="public" className="text-sm font-medium cursor-pointer">
                  Collection Visibility
                </label>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? "Anyone can view this collection" : "Only you can view this collection"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Private</span>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <span className="text-sm text-muted-foreground">Public</span>
              </div>
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
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <label htmlFor="edit-public" className="text-sm font-medium cursor-pointer">
                  Collection Visibility
                </label>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? "Anyone can view this collection" : "Only you can view this collection"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Private</span>
                <Switch
                  id="edit-public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <span className="text-sm text-muted-foreground">Public</span>
              </div>
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
    </SidebarProvider>
  );
};

export default Collections;