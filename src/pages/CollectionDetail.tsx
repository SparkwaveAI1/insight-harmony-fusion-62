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
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
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
  getPersonasInCollection,
} from "@/services/collections"; 
import { Collection } from "@/services/collections/types";
import { Persona } from "@/services/persona/types";
import { getAllPersonas } from "@/services/persona";
import AddPersonasToCollectionDialog from "@/components/personas/AddPersonasToCollectionDialog";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import NotFoundState from "@/components/persona-details/NotFoundState";
import Footer from "@/components/sections/Footer";
import PersonaCard from "@/components/personas/PersonaCard";

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
              <div className="mt-4">
                {isLoading ? (
                  <p>Loading personas...</p>
                ) : personas.length === 0 ? (
                  <p>No personas in this collection.</p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {personas.map((persona) => (
                      <PersonaCard 
                        key={persona.persona_id}
                        persona={persona}
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CollectionDetail;
