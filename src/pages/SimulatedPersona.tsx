import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { UserPlus } from 'lucide-react';

const SimulatedPersona = () => {
  const navigate = useNavigate();

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
                  <SidebarTrigger className="hidden md:flex" />
                  <h1 className="text-3xl font-bold">Create a Persona</h1>
                </div>
                
                <div className="max-w-2xl mx-auto text-center space-y-6 p-8">
                  <UserPlus className="h-16 w-16 mx-auto text-primary" />
                  <h2 className="text-2xl font-bold">Persona Creation Coming Soon</h2>
                  <p className="text-muted-foreground">
                    The persona creation interface is currently under development. 
                    You'll soon be able to create detailed AI personas with demographic traits, 
                    personality profiles, and behavioral patterns.
                  </p>
                  <div className="space-y-4">
                    <Button onClick={() => navigate('/persona-viewer')}>
                      View Existing Personas
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SimulatedPersona;