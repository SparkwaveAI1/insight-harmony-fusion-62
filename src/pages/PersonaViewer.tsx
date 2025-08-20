
import React, { useState, useEffect } from "react";
import { QueryClientProvider, QueryClient, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonaList from "@/components/personas/PersonaListV2";
import ViewerHeader from "@/components/personas/ViewerHeader";
import PersonaFetcher from "@/components/personas/PersonaFetcher";
import FilterSection from "@/components/personas/FilterSection";
import { useParams, useLocation } from "react-router-dom";
import { Persona } from "@/services/persona";
import { PersonaMigrationDialog } from "@/components/migration/PersonaMigrationDialog";

// Create a QueryClient with specific retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once for failed queries
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  },
});

// Inner component to use React Query hooks
const PersonaViewerContent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { personaId } = useParams<{ personaId?: string }>();
  const [myPersonas, setMyPersonas] = useState<Persona[]>([]);
  const [publicPersonas, setPublicPersonas] = useState<Persona[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New filter states
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedIncome, setSelectedIncome] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState("");
  
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Determine if we're in the public library view
  const isLibraryView = location.pathname.includes('/persona-library');

  // Reset the query cache when component mounts to ensure fresh data
  useEffect(() => {
    console.log("PersonaViewer mounted, invalidating personas query cache");
    queryClient.invalidateQueries({ queryKey: ['personas'] });
  }, [queryClient]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedAge("");
    setSelectedRegion("");
    setSelectedIncome("");
    setSelectedSourceType("");
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
          <div className="mb-8 flex justify-between items-start">
            <div>
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
            
            {/* Migration Dialog - only show on My Personas tab */}
            {!isLibraryView && (
              <PersonaMigrationDialog />
            )}
          </div>

          {/* Filter Section - Now with enhanced functionality */}
          <FilterSection 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onResetFilters={handleResetFilters}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            selectedAge={selectedAge}
            onAgeChange={setSelectedAge}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            selectedIncome={selectedIncome}
            onIncomeChange={setSelectedIncome}
            selectedSourceType={selectedSourceType}
            onSourceTypeChange={setSelectedSourceType}
          />

          {/* Tabs Interface */}
          <Tabs defaultValue="my-personas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="my-personas">My Personas</TabsTrigger>
              <TabsTrigger value="public-personas">Public Personas</TabsTrigger>
            </TabsList>

            <TabsContent value="my-personas" className="space-y-6">
              <PersonaList 
                searchQuery={searchQuery}
                selectedTags={selectedTags}
                selectedAge={selectedAge}
                selectedRegion={selectedRegion}
                selectedIncome={selectedIncome}
                selectedSourceType={selectedSourceType}
                mode="my-personas"
              />
            </TabsContent>

            <TabsContent value="public-personas" className="space-y-6">
              <PersonaList 
                searchQuery={searchQuery}
                selectedTags={selectedTags}
                selectedAge={selectedAge}
                selectedRegion={selectedRegion}
                selectedIncome={selectedIncome}
                selectedSourceType={selectedSourceType}
                mode="public-personas"
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
