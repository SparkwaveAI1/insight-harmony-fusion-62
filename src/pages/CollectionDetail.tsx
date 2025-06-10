import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { ArrowLeft, Calendar, MoreHorizontal, Plus, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { getCollectionById, getCollectionPersonas, removePersonaFromCollection } from "@/services/collections";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AddPersonasToCollectionDialog from "@/components/personas/AddPersonasToCollectionDialog";

interface Persona {
  persona_id: string;
  name: string;
  metadata?: {
    occupation?: string;
    age?: string;
    region?: string;
  };
  added_at?: string;
}

const CollectionDetail = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<any>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [personaToRemove, setPersonaToRemove] = useState<string | null>(null);

  useEffect(() => {
    const loadCollectionData = async () => {
      if (!collectionId) return;
      
      setIsLoading(true);
      try {
        const [collectionData, personasData] = await Promise.all([
          getCollectionById(collectionId),
          getCollectionPersonas(collectionId)
        ]);

        if (collectionData) {
          setCollection(collectionData);
          setCollectionName(collectionData.name);
          setCollectionDescription(collectionData.description || "");
        } else {
          toast.error("Collection not found");
          navigate("/collections");
          return;
        }

        // Transform the personas data to match expected format
        const transformedPersonas = personasData.map((item: any) => ({
          persona_id: item.persona_id,
          name: item.personas?.name || 'Unknown',
          metadata: item.personas?.metadata || {},
          added_at: item.added_at
        }));

        setPersonas(transformedPersonas);
      } catch (error) {
        console.error("Error loading collection:", error);
        toast.error("Failed to load collection");
        navigate("/collections");
      } finally {
        setIsLoading(false);
      }
    };

    loadCollectionData();
  }, [collectionId, navigate]);

  const handleRemovePersona = async (personaId: string) => {
    if (!collectionId) return;
    
    try {
      const success = await removePersonaFromCollection(collectionId, personaId);
      if (success) {
        setPersonas(prev => prev.filter(p => p.persona_id !== personaId));
        setPersonaToRemove(null);
      }
    } catch (error) {
      console.error("Error removing persona:", error);
      toast.error("Failed to remove persona");
    }
  };

  const handleCollectionUpdate = async () => {
    if (!collectionId) return;

    try {
      const updatedCollection = await updateCollection(collectionId, {
        name: collectionName,
        description: collectionDescription
      });

      if (updatedCollection) {
        setCollection(updatedCollection);
        toast.success("Collection updated successfully");
        setEditDialogOpen(false);
      } else {
        toast.error("Failed to update collection");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Failed to update collection");
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 pt-24">
                <div className="container py-6">
                  <h1 className="text-3xl font-bold mb-4">Loading Collection...</h1>
                </div>
              </main>
              <Footer />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!collection) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 pt-24">
                <div className="container py-6">
                  <h1 className="text-3xl font-bold mb-4">Collection Not Found</h1>
                  <p>The requested collection does not exist.</p>
                </div>
              </main>
              <Footer />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold font-plasmik">
                      {collection.name}
                    </h1>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Collection
                    </Button>
                    <Button asChild>
                      <Link to="/collections">Back to Collections</Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Personas in Collection</CardTitle>
                        <Button onClick={() => setAddDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Personas
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {personas.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {personas.map((persona) => (
                              <div key={persona.persona_id} className="relative border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="mb-2">
                                  <h3 className="text-lg font-semibold">{persona.name}</h3>
                                  {persona.metadata && (
                                    <p className="text-sm text-muted-foreground">
                                      {persona.metadata.occupation && <span>{persona.metadata.occupation}</span>}
                                      {persona.metadata.age && <span> • Age {persona.metadata.age}</span>}
                                      {persona.metadata.region && <span> • {persona.metadata.region}</span>}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Added: {format(new Date(persona.added_at || ''), "MMM d, yyyy")}
                                  </p>
                                </div>
                                <div className="absolute top-2 right-2 dropdown">
                                  <Button variant="ghost" size="icon" className="hover:bg-secondary">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                  <div className="dropdown-menu absolute top-full right-0 bg-white border rounded-md shadow-md z-10 hidden">
                                    <button
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPersonaToRemove(persona.persona_id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2 inline-block" />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 flex flex-col items-center justify-center text-center">
                            <h3 className="font-medium mb-2">No personas in this collection yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Add personas to this collection to organize them.
                            </p>
                            <Button onClick={() => setAddDialogOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Personas
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Collection Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Description
                          </h3>
                          {collection.description ? (
                            <p>{collection.description}</p>
                          ) : (
                            <p className="italic text-muted-foreground">No description provided</p>
                          )}
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Created
                          </h3>
                          <p>
                            {format(new Date(collection.created_at), "MMMM d, yyyy")}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Last Updated
                          </h3>
                          <p>
                            {format(new Date(collection.updated_at), "MMMM d, yyyy")}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Total Personas
                          </h3>
                          <p>
                            {personas.length} persona{personas.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </main>
            <Footer />

            <AddPersonasToCollectionDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              collectionId={collectionId}
              onPersonasAdded={() => loadCollectionData()}
            />

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Collection</DialogTitle>
                  <DialogDescription>
                    Update the details of your collection.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                      id="name"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      placeholder="Collection Name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={collectionDescription}
                      onChange={(e) => setCollectionDescription(e.target.value)}
                      placeholder="Collection Description"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCollectionUpdate}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {personaToRemove && (
              <Dialog open={!!personaToRemove} onOpenChange={() => setPersonaToRemove(null)}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Remove Persona</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to remove this persona from the collection?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPersonaToRemove(null)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleRemovePersona(personaToRemove)}>
                      Remove
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default CollectionDetail;
