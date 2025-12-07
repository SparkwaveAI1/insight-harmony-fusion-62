import React, { useState, useEffect } from "react";
import { QueryClientProvider, QueryClient, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicPersonasList from "@/components/personas/PublicPersonasList";
import MyPersonasList from "@/components/personas/MyPersonasList";
import ViewerHeader from "@/components/personas/ViewerHeader";
import PersonaFetcher from "@/components/personas/PersonaFetcher";
import FilterSection from "@/components/personas/FilterSection";
import { useParams, useLocation } from "react-router-dom";

import { V4Persona } from "@/types/persona-v4";

// Create a QueryClient with specific retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Inner component to use React Query hooks
const PersonaViewerContent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { personaId } = useParams<{ personaId?: string }>();
  const [myPersonas, setMyPersonas] = useState<V4Persona[]>([]);
  const [publicPersonas, setPublicPersonas] = useState<V4Persona[]>([]);
  
  // Simplified filter states - only search and age
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const location = useLocation();
  const queryClientInstance = useQueryClient();
  
  // Determine if we're in the public library view
  const isLibraryView = location.pathname.includes('/persona-library');

  // Reset the query cache when component mounts to ensure fresh data
  useEffect(() => {
    queryClientInstance.invalidateQueries({ queryKey: ['personas'] });
  }, [queryClientInstance]);

  // If in library view, ensure public personas are freshly fetched
  useEffect(() => {
    if (isLibraryView) {
      queryClientInstance.invalidateQueries({ queryKey: ['public-personas-show-all'] });
    }
  }, [isLibraryView, queryClientInstance]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAge("");
  };

  // If viewing a specific persona, show the detail view
  if (personaId) {
    return (
      <div className="relative flex min-h-svh flex-col">
        <Header />
        <main className="flex-1 pt-24">
          <div className="container py-6">
            <ViewerHeader isLoading={isLoading} />
            <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">
              Persona Details
            </h1>
            <div className="w-32 h-1 bg-primary mb-6"></div>
            <PersonaFetcher personaId={personaId} />
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="container py-6">
          <ViewerHeader isLoading={isLoading} />
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">
              {isLibraryView ? "Persona Library" : "My Personas"}
            </h1>
            {isLibraryView && (
              <p className="text-muted-foreground mb-2">
                Browse publicly shared personas from our community
              </p>
            )}
            <div className="w-32 h-1 bg-accent mb-6"></div>
          </div>

          {/* Simplified Filter Section - Search + Age only */}
          <FilterSection 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onResetFilters={handleResetFilters}
            selectedAge={selectedAge}
            onAgeChange={(val) => setSelectedAge(val === "any" ? "" : val)}
            isSearching={isSearching}
          />

          {/* Tabbed View */}
          <Tabs defaultValue='my-personas' className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="my-personas">My Personas</TabsTrigger>
              <TabsTrigger value="public-personas">Public Personas</TabsTrigger>
            </TabsList>

            <TabsContent value="my-personas" className="space-y-6">
              <MyPersonasList
                onPersonasLoad={setMyPersonas}
                searchQuery={searchQuery}
                selectedAge={selectedAge}
                onSearchingChange={setIsSearching}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              />
            </TabsContent>

            <TabsContent value="public-personas" className="space-y-6">
              <PublicPersonasList 
                onPersonasLoad={setPublicPersonas}
                searchQuery={searchQuery}
                selectedAge={selectedAge}
                onSearchingChange={setIsSearching}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

const PersonaViewer = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <PersonaViewerContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
};

export default PersonaViewer;
