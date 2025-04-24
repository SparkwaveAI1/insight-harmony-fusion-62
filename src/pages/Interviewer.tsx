
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import HeroSection from "@/components/interviewer/HeroSection";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const Interviewer = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="flex-grow">
            <HeroSection />
          </main>
          <Footer />
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Interviewer;
