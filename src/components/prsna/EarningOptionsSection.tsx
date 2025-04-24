
import { BrainCircuit, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import EarningOptionCard from "./EarningOptionCard";

const EarningOptionsSection = () => {
  return (
    <div className="container px-4 mx-auto">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h2 className="text-3xl font-bold mb-2 text-center">How to Earn $PRSNA</h2>
          <p className="text-gray-400 text-center mb-10">
            Multiple ways to earn rewards while contributing to AI research
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create AI Personas Card */}
          <EarningOptionCard
            icon={BrainCircuit}
            title="Create AI Personas"
            description="Build and train unique AI personas with specific demographics, behaviors, and preferences. Your personas will be used in qualitative research studies to generate insights."
            benefits={[
              "Earn 50-200 $PRSNA per approved persona",
              "Earn royalties when your personas are used in research",
              "Persona creators get priority for focus groups"
            ]}
            buttonText="Coming Soon"
            disabled
          />
          
          {/* Join AI Focus Groups Card */}
          <EarningOptionCard
            icon={Users}
            title="Join AI Focus Groups"
            description="Participate in moderated AI focus groups to provide insights on products, services, and market trends. Your contributions help shape the future of AI-powered research."
            benefits={[
              "Earn 10-50 $PRSNA per focus group session",
              "Bonus rewards for high-quality contributions",
              "$PRSNA stakers get access to premium sessions"
            ]}
            buttonText="Explore Focus Groups"
            link="/ai-focus-groups"
          />
        </div>
      </div>
    </div>
  );
};

export default EarningOptionsSection;
