
import { useState, useEffect } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import PersonaList from "@/components/personas/PersonaList";
import PersonaSummary from "@/components/personas/PersonaSummary";
import { Persona } from "@/services/persona/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Create a QueryClient for this route
const queryClient = new QueryClient();

const MyPersonas = () => {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(Date.now()); // Used to force re-render of PersonaList

  const handleRefresh = () => {
    console.log("Refreshing personas...");
    setIsLoading(true);
    // Force a re-render of PersonaList by updating the key
    setKey(Date.now());
    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ['personas'] });
    
    // Show in-progress toast
    toast.success("Refreshing personas...");
    
    // Set isLoading back to false after a short delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Check if user is logged in
    if (user) {
      console.log("Current user ID:", user.id);
    } else {
      console.log("No user is logged in");
      toast.error("You must be logged in to view your personas");
    }
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 pt-24">
                <div className="container py-6">
                  <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">
                        My Personas
                      </h1>
                      <p className="text-muted-foreground">
                        Personas you've created or saved to your profile
                      </p>
                      <div className="w-32 h-1 bg-accent mt-2"></div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="mt-4 md:mt-0 gap-2 self-start"
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  <PersonaList 
                    key={key}
                    onPersonasLoad={setPersonas}
                    filterByCurrentUser={true}
                  />
                  
                  {personas.length > 0 && <PersonaSummary personas={personas} />}
                </div>
              </main>
              <Footer />
              <Toaster />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
};

export default MyPersonas;
