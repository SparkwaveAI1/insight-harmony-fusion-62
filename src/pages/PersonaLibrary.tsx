
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import PersonaList from "@/components/personas/PersonaList";
import PersonaSummary from "@/components/personas/PersonaSummary";
import { useState } from "react";

const PersonaLibrary = () => {
  const [personas, setPersonas] = useState<any[]>([]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">
                    Persona Library
                  </h1>
                  <p className="text-muted-foreground">
                    Browse all publicly available personas
                  </p>
                  <div className="w-32 h-1 bg-accent mt-2"></div>
                </div>
                
                <PersonaList 
                  onPersonasLoad={setPersonas}
                  publicOnly={true}
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
  );
};

export default PersonaLibrary;
