import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { FlaskConical } from 'lucide-react';

const Research = () => {
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
                  <h1 className="text-3xl font-bold">Researcher</h1>
                </div>
                
                <div className="max-w-2xl mx-auto text-center space-y-6 p-8">
                  <FlaskConical className="h-16 w-16 mx-auto text-primary" />
                  <h2 className="text-2xl font-bold">Research Tools Coming Soon</h2>
                  <p className="text-muted-foreground">
                    Advanced research tools and analytics are currently under development. 
                    You'll soon be able to conduct comprehensive qualitative research 
                    using AI-powered personas and advanced analytics.
                  </p>
                  <div className="space-y-4">
                    <Button onClick={() => navigate('/projects')}>
                      View Projects
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

export default Research;