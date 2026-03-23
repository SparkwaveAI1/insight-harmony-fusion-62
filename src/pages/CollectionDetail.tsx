import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useFilteredPersonaSearch, FilteredSearchResult } from "@/hooks/useFilteredPersonaSearch";
import { PersonaFilterPanel } from "@/components/personas/PersonaFilterPanel";
import { DEFAULT_FILTERS, PersonaFilters } from "@/types/personaFilters";
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
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPersonasDialog, setShowAddPersonasDialog] = useState(false);
  const [showEditCollectionDialog, setShowEditCollectionDialog] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Server-side filtered search scoped to this collection
  const {
    results: filteredResults,
    totalCount,
    isLoading: isLoadingPersonas,
    filters,
    setFilters,
    resetFilters,
    search: executeSearch,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useFilteredPersonaSearch(DEFAULT_FILTERS, {
    publicOnly: false,
    collectionIds: collectionId ? [collectionId] : [],
    limit: 30,
  });

  // Scroll + load collection metadata on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    if (collectionId) {
      loadCollection(collectionId);
    }
  }, [collectionId]);

  // Re-run search whenever filters or page change (auto-fires on mount too)
  useEffect(() => {
    if (collectionId) {
      executeSearch();
    }
  }, [filters, currentPage, collectionId]);

  // Map RPC results to V4Persona shape for PersonaCard
  const toV4Persona = useCallback((r: FilteredSearchResult): V4Persona => ({
    persona_id: r.persona_id,
    name: r.name,
    profile_image_url: r.profile_image_url,
    profile_thumbnail_url: r.profile_thumbnail_url,
    user_id: r.user_id ?? '',
    is_public: r.is_public,
    schema_version: 'v4',
    created_at: r.created_at,
    updated_at: r.created_at,
    conversation_summary: {
      demographics: {
        age: r.age,
        gender: r.gender,
        occupation: r.occupation,
        location: `${r.city ?? ''}${r.city && r.state_region ? ', ' : ''}${r.state_region ?? ''}`.trim(),
      },
      character_description: r.background || '',
    } as any,
    full_profile: null,
  } as unknown as V4Persona), []);

  const displayedPersonas = useMemo(
    () => filteredResults.map(toV4Persona),
    [filteredResults, toV4Persona]
  );

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
    // Re-run search to pick up newly added personas
    executeSearch();
  };

  const handleVisibilityChange = (isPublic: boolean) => {
    if (collection) {
      setCollection({ ...collection, is_public: isPublic });
    }
  };

  const handleRemovePersonaFromCollection = async (personaId: string, cId: string) => {
    try {
      const success = await removePersonaFromCollection(cId, personaId);
      if (success) {
        toast.success("Persona removed from collection");
        executeSearch(); // refresh results
      } else {
        toast.error("Failed to remove persona from collection");
      }
    } catch (error) {
      console.error("Error removing persona from collection:", error);
      toast.error("Failed to remove persona from collection");
    }
  };

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

              {/* Full filter panel — same as Persona Library */}
              <div className="mt-4">
                <PersonaFilterPanel
                  filters={filters}
                  onChange={(newFilters: PersonaFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Results count */}
              <div className="mt-3 mb-2 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {isLoadingPersonas
                    ? 'Loading...'
                    : `${totalCount.toLocaleString()} persona${totalCount !== 1 ? 's' : ''}${hasActiveFilters ? ' match filters' : ' in collection'}`}
                </p>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="text-xs text-primary hover:underline">
                    Clear filters
                  </button>
                )}
              </div>

              <div className="mt-2">
                {isLoadingPersonas ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
                    <p className="text-muted-foreground">Loading personas...</p>
                  </div>
                ) : displayedPersonas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">
                      {hasActiveFilters ? 'No personas match your filters.' : 'No personas in this collection yet.'}
                    </p>
                    {hasActiveFilters && (
                      <button onClick={resetFilters} className="text-sm text-primary mt-2 hover:underline">
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1 || isLoadingPersonas}
                        >
                          ← Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages || isLoadingPersonas}
                        >
                          Next →
                        </Button>
                      </div>
                    )}
                  </>
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
