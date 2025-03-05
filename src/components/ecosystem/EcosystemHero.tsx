
import { ArrowRight, Rocket, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";

type EcosystemHeroProps = {
  isWalletConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  setActiveTab: (tab: string) => void;
};

const EcosystemHero = ({ 
  isWalletConnected, 
  connectWallet, 
  disconnectWallet, 
  setActiveTab 
}: EcosystemHeroProps) => {
  return (
    <Section className="bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center justify-center bg-primary/20 px-4 py-2 rounded-full mb-6">
              <Rocket className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Base Chain</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-plasmik">
              PersonaAI Web3: Research Layer for Base Chain
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-gray-300 text-pretty mb-10 max-w-2xl mx-auto">
              The $PRSNA token powers AI-driven market research and qualitative intelligence. 
              Stake $PRSNA to unlock premium insights, research tools, and AI-powered predictions.
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            {!isWalletConnected ? (
              <Button 
                variant="primary" 
                size="lg" 
                className="group bg-gradient-to-r from-primary to-primary/80 border-none"
                onClick={connectWallet}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="group border-gray-700 hover:bg-gray-800"
                  onClick={disconnectWallet}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </Button>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="group bg-gradient-to-r from-primary to-primary/80 border-none"
                  onClick={() => setActiveTab("staking")}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Stake $PRSNA
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                </Button>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default EcosystemHero;
