
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Footer from "@/components/sections/Footer";
import HeroSection from "@/components/prsna/HeroSection";
import EarningOptionsSection from "@/components/prsna/EarningOptionsSection";
import RoadmapSection from "@/components/prsna/RoadmapSection";
import FeedbackForm from "@/components/prsna/FeedbackForm";

const EarnPRSNA = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <Section className="bg-gradient-to-br from-gray-900 to-gray-800">
          <HeroSection />
        </Section>

        {/* How to Earn Section */}
        <Section className="bg-gray-900">
          <EarningOptionsSection />
        </Section>

        {/* Roadmap Section */}
        <Section className="bg-gray-800">
          <RoadmapSection />
        </Section>

        {/* Feedback Section */}
        <Section className="bg-gray-900">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">We Value Your Input</h2>
              <p className="text-gray-300 text-lg">
                Help us shape the future of $PRSNA and PersonaAI by sharing your thoughts and suggestions.
              </p>
            </div>
            <FeedbackForm />
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default EarnPRSNA;
