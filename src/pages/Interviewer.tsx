
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import HeroSection from "@/components/interviewer/HeroSection";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const Interviewer = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1">
              <div className="container py-6">
                <div className="flex items-center justify-between">
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                <HeroSection />
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

export default Interviewer;
