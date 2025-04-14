
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import HeroSection from "@/components/interviewer/HeroSection";
import OptionsSection from "@/components/interviewer/OptionsSection";

const Interviewer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <OptionsSection />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Interviewer;
