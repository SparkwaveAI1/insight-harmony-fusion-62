
import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getCollectionById, deleteCollection } from "@/services/collections/collectionOperations";
import PersonaList from "@/components/personas/PersonaList";
import PersonaSummary from "@/components/personas/PersonaSummary";
import AddPersonasToCollectionDialog from "@/components/personas/AddPersonasToCollectionDialog";

const CollectionDetail = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState<any[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    if (collectionId) {
      fetchCollection(collectionId);
    }
  }, [collectionId]);

  const fetchCollection = async (id: string) => {
    try {
      setLoading(true);
      const collectionData = await getCollectionById(id);
      setCollection(collectionData);
    } catch (error) {
      console.error("Error fetching collection:", error);
      toast.error("Failed to load collection");
      navigate("/collections");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collectionId) return;
    
    try {
      await deleteCollection(collectionId);
      toast.success("Collection deleted successfully");
      navigate("/collections");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
    }
  };

  const refreshPersonas = () => {
    if (collectionId) {
      // Force PersonaList to refetch by triggering a state change
      const personaListKey = Date.now();
      setPersonas([]); // Clear current personas
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/collections")} 
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Collections
                </Button>
                
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <div className="mt-8">
                      <Skeleton className="h-[300px] w-full" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h1 className="text-3xl font-bold">{collection?.name}</h1>
                        {collection?.description && (
                          <p className="text-muted-foreground mt-2">{collection.description}</p>
                        )}
                        <div className="w-32 h-1 bg-accent mt-2"></div>
                      </div>
                      <Button onClick={() => setAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Personas
                      </Button>
                    </div>
                    
                    <PersonaList 
                      onPersonasLoad={setPersonas}
                      collectionId={collectionId}
                      onDeleteCollection={handleDeleteCollection}
                    />
                    
                    {personas.length > 0 && <PersonaSummary personas={personas} />}
                  </>
                )}
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </SidebarInset>
      </div>
      
      {collectionId && (
        <AddPersonasToCollectionDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          collectionId={collectionId}
          onAddComplete={refreshPersonas}
        />
      )}
    </SidebarProvider>
  );
};

export default CollectionDetail;
