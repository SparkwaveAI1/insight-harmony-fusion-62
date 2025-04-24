
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import HeroSection from "@/components/simulated-persona/HeroSection";
import HowItWorksSection from "@/components/simulated-persona/HowItWorksSection";
import UseCasesSection from "@/components/simulated-persona/UseCasesSection";
import WhyDifferentSection from "@/components/simulated-persona/WhyDifferentSection";

export default function SimulatedPersona() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="flex-grow">
            <HeroSection />
            <HowItWorksSection />
            <UseCasesSection />
            <WhyDifferentSection />
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
