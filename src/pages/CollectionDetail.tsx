import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ArrowLeft, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getCollectionById,
  deleteCollection,
  getPersonasInCollectionWithDetails,
} from "@/services/collections";
import { removePersonaFromCollection } from "@/services/collections/personaCollectionOperations";
import { Collection } from "@/services/collections/types";
import { V4Persona } from "@/types/persona-v4";

import AddPersonasToCollectionDialog from "@/components/personas/AddPersonasToCollectionDialog";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";

import NotFoundState from "@/components/persona-details/NotFoundState";
import Footer from "@/components/sections/Footer";
import PersonaCard from "@/components/personas/PersonaCard";
import CollectionVisibilityToggle from "@/components/collections/CollectionVisibilityToggle";
import { supabase } from "@/integrations/supabase/client";

const CollectionDetail = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [personas, setPersonas] = useState<V4Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);
  const [showAddPersonasDialog, setShowAddPersonasDialog] = useState(false);
  const [showEditCollectionDialog, setShowEditCollectionDialog] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when collection changes
    window.scrollTo(0, 0);
    
    if (collectionId) {
      loadCollection(collectionId);
      loadPersonas(collectionId);
    }
  }, [collectionId]);

  const loadCollection = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getCollectionById(id);
      if (data) {
        setCollection(data);
        // Check if current user is the owner
        const { data: { user } } = await supabase.auth.getUser();
        setIsOwner(user?.id === data.user_id);
      } else {
        toast.error("Collection not found");
      }
    } catch (error) {
      console.error("Error loading collection:", error);
      toast.error("Failed to load collection details");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPersonas = async (collectionId: string) => {
    setIsLoadingPersonas(true);
    try {
      const collectionPersonas = await getPersonasInCollectionWithDetails(collectionId);
      setPersonas(collectionPersonas);
    } catch (error) {
      console.error("Error loading personas in collection:", error);
      toast.error("Failed to load personas in collection");
    } finally {
      setIsLoadingPersonas(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (collectionId && !isDeleting) {
      setIsDeleting(true);
      try {
        await deleteCollection(collectionId);
        toast.success("Collection deleted successfully!");
        navigate("/collections");
      } catch (error) {
        console.error("Error deleting collection:", error);
        toast.error("Failed to delete collection");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handlePersonasAdded = () => {
    // Reload personas after adding
    if (collectionId) {
      loadPersonas(collectionId);
    }
  };

  const handleVisibilityChange = (isPublic: boolean) => {
    if (collection) {
      setCollection({ ...collection, is_public: isPublic });
    }
  };

  const handleRemovePersonaFromCollection = async (personaId: string, collectionId: string) => {
    try {
      const success = await removePersonaFromCollection(collectionId, personaId);
      if (success) {
        // Remove the persona from local state immediately for better UX
        setPersonas(prev => prev.filter(p => p.persona_id !== personaId));
        toast.success("Persona removed from collection");
      } else {
        toast.error("Failed to remove persona from collection");
      }
    } catch (error) {
      console.error("Error removing persona from collection:", error);
      toast.error("Failed to remove persona from collection");
    }
  };

  // Helpers: extract name/occupation/age from V4Persona (fields may be in root or full_profile)
  const getOccupation = (p: V4Persona): string => {
    const raw = p as any;
    return raw.occupation_computed
      ?? p.full_profile?.identity?.occupation
      ?? p.conversation_summary?.demographics?.occupation
      ?? '';
  };
  const getAge = (p: V4Persona): number => {
    const raw = p as any;
    return raw.age_computed
      ?? p.full_profile?.identity?.age
      ?? 0;
  };

  // Filtered + sorted personas (client-side, all personas already loaded)
  const displayedPersonas = useMemo(() => {
    let result = personas;

    // Filter: case-insensitive match on name or occupation
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const name = (p.name ?? '').toLowerCase();
        const occupation = getOccupation(p).toLowerCase();
        return name.includes(q) || occupation.includes(q);
      });
    }

    // Sort
    const sorted = [...result];
    switch (sortOrder) {
      case 'name-asc':
        sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        break;
      case 'name-desc':
        sorted.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
        break;
      case 'age-asc':
        sorted.sort((a, b) => getAge(a) - getAge(b));
        break;
      case 'age-desc':
        sorted.sort((a, b) => getAge(b) - getAge(a));
        break;
      case 'occupation-asc':
        sorted.sort((a, b) => getOccupation(a).localeCompare(getOccupation(b)));
        break;
    }
    return sorted;
  }, [personas, searchQuery, sortOrder]);

  // Add a not found state if collection couldn't be loaded
  if (!isLoading && !collection) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-grow">
        <div className="container py-6">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="p-0">
              <Link to="/collections" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Collections
              </Link>
            </Button>
          </div>

          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{collection?.name || "Loading..."}</h1>
              <p className="text-muted-foreground">
                {collection?.description || "No description provided"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowEditCollectionDialog(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Collection
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personas in this Collection</CardTitle>
              <CardDescription>
                Manage personas associated with this collection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <Button onClick={() => setShowAddPersonasDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Personas
                </Button>
                {collection && (
                  <CollectionVisibilityToggle
                    collectionId={collection.id}
                    isPublic={collection.is_public}
                    isOwner={isOwner}
                    onVisibilityChange={handleVisibilityChange}
                  />
                )}
              </div>
              <Separator />

              {/* Search + Sort controls */}
              {!isLoading && personas.length > 0 && (
                <div className="mt-4 mb-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or occupation..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full sm:w-52">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name A → Z</SelectItem>
                      <SelectItem value="name-desc">Name Z → A</SelectItem>
                      <SelectItem value="age-asc">Age: Youngest First</SelectItem>
                      <SelectItem value="age-desc">Age: Oldest First</SelectItem>
                      <SelectItem value="occupation-asc">Occupation A → Z</SelectItem>
                    </SelectContent>
                  </Select>
                  {searchQuery && (
                    <p className="text-sm text-muted-foreground self-center whitespace-nowrap">
                      {displayedPersonas.length} of {personas.length} personas
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4">
                {isLoadingPersonas ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
                    <p className="text-muted-foreground">Loading personas...</p>
                  </div>
                ) : personas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No personas in this collection yet.</p>
                  </div>
                ) : displayedPersonas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No personas match "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery('')} className="text-sm text-primary mt-2 hover:underline">
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {displayedPersonas.map((persona) => (
                      <PersonaCard 
                        key={persona.persona_id}
                        persona={persona}
                        hideChat={true}
                        collectionId={collectionId}
                        onRemoveFromCollection={handleRemovePersonaFromCollection}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {showAddPersonasDialog && (
            <AddPersonasToCollectionDialog
              open={showAddPersonasDialog}
              onOpenChange={setShowAddPersonasDialog}
              collectionId={collectionId || ""}
              onPersonasAdded={handlePersonasAdded}
            />
          )}

          {showEditCollectionDialog && (
            <EditCollectionDialog
              open={showEditCollectionDialog}
              onOpenChange={setShowEditCollectionDialog}
              collection={collection}
              onCollectionUpdate={loadCollection}
            />
          )}

          {/* Delete Collection Section - Moved to bottom */}
          <div className="mt-12 pt-6 border-t">
            <div className="max-w-2xl">
              <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete a collection, there is no going back. This will permanently delete the collection and remove all personas from it.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Collection
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      collection and remove all personas from it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCollection} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CollectionDetail;
