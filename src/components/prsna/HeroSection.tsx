
import { Book, UserPlus, HandCoins } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import RewardsIllustration from "./RewardsIllustration";

const HeroSection = () => {
  return (
    <div className="container px-4 mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Left side - Text Content */}
        <div className="w-full lg:w-1/2">
          <Reveal>
            <div className="inline-flex items-center justify-center bg-secondary/20 px-4 py-2 rounded-full mb-6">
              <HandCoins className="h-5 w-5 text-secondary mr-2" />
              <span className="text-sm font-medium text-secondary">Web3 Intelligence</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-plasmik">
              🚧 Building the Future of On-Chain Behavioral Intelligence
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-gray-300 text-pretty mb-10">
              PersonaAI is launching ERC-6551 personas—dynamic, evolving behavioral assets anchored onchain. 
              $PRSNA will power simulations, licensing, and the cognitive layer of Web3.
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="#token-utility">
                <Button
                  variant="primary"
                  size="lg"
                  className="group bg-gradient-to-r from-primary to-primary/80 border-none"
                >
                  <Book className="w-4 h-4 mr-2" />
                  Learn About $PRSNA Utility
                </Button>
              </Link>
              <Link to="/persona-creation/landing">
                <Button
                  variant="secondary"
                  size="lg"
                  className="group"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Contribute a Persona
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
        
        {/* Right side - Rewards Illustration */}
        <RewardsIllustration />
      </div>
    </div>
  );
};

export default HeroSection;
