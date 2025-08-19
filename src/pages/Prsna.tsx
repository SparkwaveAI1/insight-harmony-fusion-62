import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Coins } from 'lucide-react';

const Prsna = () => {
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
                  <h1 className="text-3xl font-bold">PRSNA Token</h1>
                </div>
                
                <div className="max-w-2xl mx-auto text-center space-y-6 p-8">
                  <Coins className="h-16 w-16 mx-auto text-primary" />
                  <h2 className="text-2xl font-bold">PRSNA Token Coming Soon</h2>
                  <p className="text-muted-foreground">
                    The PRSNA token system is currently under development. 
                    This will enable advanced features, premium personas, 
                    and enhanced research capabilities.
                  </p>
                  <div className="space-y-4">
                    <Button onClick={() => navigate('/docs')}>
                      Learn More
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

export default Prsna;