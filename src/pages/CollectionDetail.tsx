import React, { useState, useEffect } from "react";
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
import { Plus, Pencil, Trash2, ArrowLeft, X, Globe, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  getPersonasInCollection,
  updateCollection,
} from "@/services/collections";
import { removePersonaFromCollection } from "@/services/collections/personaCollectionOperations";
import { Collection } from "@/services/collections/types";
import { Persona } from "@/services/persona/types";
import { getAllPersonas } from "@/services/persona";
import AddPersonasToCollectionDialog from "@/components/personas/AddPersonasToCollectionDialog";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import NotFoundState from "@/components/persona-details/NotFoundState";
import Footer from "@/components/sections/Footer";

const CollectionDetail = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPersonasDialog, setShowAddPersonasDialog] = useState(false);
  const [showEditCollectionDialog, setShowEditCollectionDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
    setIsLoading(true);
    try {
      const personaIds = await getPersonasInCollection(collectionId);
      if (personaIds && personaIds.length > 0) {
        // Fetch all personas to filter by IDs in collection
        const allPersonas = await getAllPersonas();
        const filteredPersonas = allPersonas.filter((persona) =>
          personaIds.includes(persona.persona_id)
        );
        setPersonas(filteredPersonas);
      } else {
        setPersonas([]); // No personas in collection
      }
    } catch (error) {
      console.error("Error loading personas in collection:", error);
      toast.error("Failed to load personas in collection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (collectionId) {
      try {
        await deleteCollection(collectionId);
        toast.success("Collection deleted successfully!");
        // Redirect to the collections page after deletion
        navigate("/collections");
      } catch (error) {
        console.error("Error deleting collection:", error);
        toast.error("Failed to delete collection");
      }
    }
  };

  const handlePersonasAdded = () => {
    // Reload personas after adding
    if (collectionId) {
      loadPersonas(collectionId);
    }
  };

  const handleRemovePersona = async (personaId: string) => {
    if (!collectionId) return;
    
    try {
      const success = await removePersonaFromCollection(collectionId, personaId);
      if (success) {
        toast.success("Persona removed from collection");
        loadPersonas(collectionId); // Reload the personas list
      } else {
        toast.error("Failed to remove persona from collection");
      }
    } catch (error) {
      console.error("Error removing persona from collection:", error);
      toast.error("Failed to remove persona from collection");
    }
  };

  const handlePrivacyToggle = async (isPublic: boolean) => {
    if (!collection) return;
    
    try {
      const result = await updateCollection(collection.id, { is_public: isPublic });
      if (result) {
        setCollection({ ...collection, is_public: isPublic });
        toast.success(`Collection is now ${isPublic ? 'public' : 'private'}`);
      }
    } catch (error) {
      console.error("Error updating collection privacy:", error);
      toast.error("Failed to update collection privacy");
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

          <div className="mb-8 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{collection?.name || "Loading..."}</h1>
                {collection && (
                  <>
                    {collection.is_public ? (
                      <Globe className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </>
                )}
              </div>
              <p className="text-muted-foreground mb-4">
                {collection?.description || "No description provided"}
              </p>
              {collection && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {collection.is_public ? 'Public' : 'Private'}
                    </span>
                    <Switch
                      checked={collection.is_public}
                      onCheckedChange={handlePrivacyToggle}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {collection.is_public ? 'Visible to everyone' : 'Only visible to you'}
                  </span>
                </div>
              )}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEditCollectionDialog(true)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Collection
              </Button>
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
                    <AlertDialogAction onClick={handleDeleteCollection}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personas in this Collection</CardTitle>
              <CardDescription>
                Manage personas associated with this collection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => setShowAddPersonasDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Personas
                </Button>
              </div>
              <Separator />
              <ScrollArea className="h-[400px] mt-4">
                {isLoading ? (
                  <p>Loading personas...</p>
                ) : personas.length === 0 ? (
                  <p>No personas in this collection.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {personas.map((persona) => (
                      <Card key={persona.persona_id} className="hover:bg-secondary relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemovePersona(persona.persona_id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Link
                          to={`/persona/${persona.persona_id}`}
                          className="block"
                        >
                          <CardHeader>
                            <CardTitle className="text-sm font-medium pr-8">
                              {persona.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge variant="secondary">Persona</Badge>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CollectionDetail;
