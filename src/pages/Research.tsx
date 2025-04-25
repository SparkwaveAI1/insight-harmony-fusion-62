
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ResearchHero from "@/components/sections/research/ResearchHero";
import ResearchModes from "@/components/sections/research/ResearchModes";
import ResearchOutcomes from "@/components/sections/research/ResearchOutcomes";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const Research = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <div className="flex items-center justify-between">
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                <ResearchHero />
                <ResearchModes />
                <ResearchOutcomes />
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

export default Research;
