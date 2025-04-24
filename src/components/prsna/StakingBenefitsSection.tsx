
import { Wallet, HandCoins, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import BenefitCard from "./BenefitCard";

const StakingBenefitsSection = () => {
  return (
    <div className="container px-4 mx-auto">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
            Stake $PRSNA for Enhanced Rewards
          </h2>
          <p className="text-gray-400 text-center mb-10">
            Stake your tokens to unlock premium earning opportunities
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <BenefitCard
              icon={Wallet}
              title="Priority Access"
              description="Stakers get first access to high-paying research opportunities and focus groups"
            />
            <BenefitCard
              icon={HandCoins}
              title="Bonus Rewards"
              description="Earn up to 50% more $PRSNA for each contribution based on your staking tier"
            />
            <BenefitCard
              icon={GraduationCap}
              title="Premium Research"
              description="Access exclusive high-tier research opportunities reserved for stakers"
            />
          </div>
        </Reveal>
        
        <Reveal delay={200}>
          <div className="text-center">
            <Link to="/prsna-ecosystem">
              <Button 
                variant="primary" 
                size="lg" 
                className="group bg-gradient-to-r from-primary to-primary/80 border-none"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Stake $PRSNA Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default StakingBenefitsSection;
