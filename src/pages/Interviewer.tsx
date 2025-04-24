
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import HeroSection from "@/components/interviewer/HeroSection";

const Interviewer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Interviewer;
