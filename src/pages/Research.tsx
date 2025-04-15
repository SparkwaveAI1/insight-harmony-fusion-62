
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ResearchHero from "@/components/sections/research/ResearchHero";
import ResearchModes from "@/components/sections/research/ResearchModes";
import ResearchOutcomes from "@/components/sections/research/ResearchOutcomes";

const Research = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ResearchHero />
        <ResearchModes />
        <ResearchOutcomes />
      </main>
      <Footer />
    </div>
  );
};

export default Research;
