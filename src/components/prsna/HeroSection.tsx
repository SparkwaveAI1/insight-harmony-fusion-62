
import { Link } from "react-router-dom";
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
              🚧 Web3 Intelligence
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
        </div>
        
        {/* Right side - Rewards Illustration */}
        <RewardsIllustration />
      </div>
    </div>
  );
};

export default HeroSection;
