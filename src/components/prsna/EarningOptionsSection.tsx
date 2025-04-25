
import { BrainCircuit, Coins } from "lucide-react";
import Reveal from "@/components/ui-custom/Reveal";
import EarningOptionCard from "./EarningOptionCard";

const EarningOptionsSection = () => {
  return (
    <div className="container px-4 mx-auto">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h2 className="text-3xl font-bold mb-2 text-center">💡 How $PRSNA Will Work</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Create AI Personas Today */}
          <EarningOptionCard
            icon={BrainCircuit}
            title="Create AI Personas Today"
            description="Contribute to PersonaAI's growing network of behavioral models."
            benefits={[
              "Personas created now will transition into ERC-6551 on-chain assets",
              "Early contributors will benefit from future $PRSNA-powered simulations",
              "Be part of the future of behavioral intelligence"
            ]}
          />
          
          {/* The $PRSNA Value Loop */}
          <EarningOptionCard
            icon={Coins}
            title="The $PRSNA Value Loop"
            description="Join the ecosystem of behavioral intelligence and value creation."
            benefits={[
              "Power behavioral simulations across Web3",
              "License and sponsor high-demand personas",
              "Earn when your personas drive real insight (launching soon)"
            ]}
          />
        </div>

        <Reveal>
          <p className="text-center text-gray-400 text-sm italic">
            Token utility and rewards are in development. No active staking or earning programs live yet.
          </p>
        </Reveal>
      </div>
    </div>
  );
};

export default EarningOptionsSection;
