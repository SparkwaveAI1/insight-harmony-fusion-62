
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ResearchHero from "@/components/sections/research/ResearchHero";
import ResearchModes from "@/components/sections/research/ResearchModes";
import ResearchOutcomes from "@/components/sections/research/ResearchOutcomes";

export default function Research() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="flex-grow">
            <ResearchHero />
            <ResearchModes />
            <ResearchOutcomes />
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
