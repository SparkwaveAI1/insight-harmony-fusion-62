import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import {
  Collection,
  getPersonasInCollection,
  deleteCollection,
} from "@/services/collections/collectionsService";
import { supabase } from "@/integrations/supabase/client";
import Button from "@/components/ui-custom/Button";
import { ChevronLeft, Trash2, Edit, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import PersonaCard from "@/components/personas/PersonaCard";
import { Persona } from "@/services/persona/types";
import { dbPersonaToPersona } from "@/services/persona/mappers";

const CollectionDetail = () => {
  const { collectionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (user && collectionId) {
      fetchCollection();
      fetchPersonasInCollection();
    }
  }, [user, collectionId]);

  const fetchCollection = async () => {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (error) throw error;
      setCollection(data);
    } catch (error) {
      console.error("Error fetching collection:", error);
      toast.error("Failed to load collection details");
      navigate("/collections");
    }
  };

  const fetchPersonasInCollection = async () => {
    setLoading(true);
    try {
      const personaIds = await getPersonasInCollection(collectionId as string);
      
      if (personaIds.length === 0) {
        setPersonas([]);
        setLoading(false);
        return;
      }

      // Fetch all personas that are in this collection
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .in("persona_id", personaIds);

      if (error) throw error;
      
      // Convert DB personas to the Persona type with required fields
      const convertedPersonas = data?.map(dbPersonaToPersona) || [];
      setPersonas(convertedPersonas);
    } catch (error) {
      console.error("Error fetching personas:", error);
      toast.error("Failed to load personas");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;

    const result = await deleteCollection(collection.id);
    if (result) {
      navigate("/collections");
    }
  };

  const handleEditCollection = () => {
    navigate(`/collection/${collectionId}/edit`);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-6 flex flex-col">
            <div className="mb-8">
              <button 
                onClick={() => navigate("/collections")}
                className="flex items-center text-muted-foreground hover:text-foreground mb-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Collections
              </button>

              {collection ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{collection.name}</h1>
                    {collection.description && (
                      <p className="text-muted-foreground mt-2">{collection.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="outline" onClick={handleEditCollection}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-14 bg-muted/20 animate-pulse rounded-lg w-1/3"></div>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold">Personas in this collection</h2>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-lg bg-muted/30 animate-pulse"></div>
                ))}
              </div>
            ) : personas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg">
                <div className="rounded-full bg-muted/20 p-6">
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mt-6">No personas in this collection</h3>
                <p className="text-muted-foreground mt-2">
                  Add personas to this collection from the persona viewer
                </p>
                <Button 
                  className="mt-6"
                  onClick={() => navigate("/persona-viewer")}
                >
                  Browse Personas
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personas.map((persona) => (
                  <PersonaCard key={persona.persona_id} persona={persona} />
                ))}
              </div>
            )}

            {/* Delete Collection Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete Collection</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    Are you sure you want to delete "{collection?.name}"? This action cannot
                    be undone and all persona references will be removed.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleDeleteCollection}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default CollectionDetail;
