
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Footer from "@/components/sections/Footer";
import AvatarFeatureDark from "@/components/ecosystem/AvatarFeatureDark";
import HeroSection from "@/components/prsna/HeroSection";
import EarningOptionsSection from "@/components/prsna/EarningOptionsSection";
import RoadmapSection from "@/components/prsna/RoadmapSection";

const EarnPRSNA = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <Section className="bg-gradient-to-br from-gray-900 to-gray-800">
          <HeroSection />
        </Section>

        {/* AI Avatar Feature Section */}
        <Section className="bg-white from-gray-50 to-gray-100 py-16 mt-0">
          <AvatarFeatureDark />
        </Section>

        {/* How to Earn Section */}
        <Section className="bg-gray-900">
          <EarningOptionsSection />
        </Section>

        {/* Roadmap Section */}
        <Section className="bg-gray-800">
          <RoadmapSection />
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default EarnPRSNA;
