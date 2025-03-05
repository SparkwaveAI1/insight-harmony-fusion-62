
import { ArrowRight, Rocket, Wallet, Bot } from "lucide-react";
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
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Left side - Text Content */}
          <div className="w-full lg:w-1/2">
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
              <p className="text-gray-300 text-pretty mb-10">
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
          
          {/* Right side - AI Avatar Placeholder */}
          <div className="w-full lg:w-1/2">
            <Reveal delay={400}>
              <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6 h-full">
                <div className="aspect-video bg-gray-900/80 rounded-lg flex flex-col items-center justify-center border border-gray-700 mb-4">
                  <Bot className="h-20 w-20 text-primary/50 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">AI Research Avatar</h3>
                  <p className="text-gray-400 text-center max-w-md mb-4">
                    Talk with our AI research agent to explore market insights and token utility
                  </p>
                  <div className="px-3 py-1 bg-green-900/40 text-green-400 rounded-full text-xs flex items-center">
                    <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-green-400"></span>
                    Coming Soon
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    variant="secondary" 
                    className="group"
                    onClick={() => setActiveTab("ai-agent")}
                  >
                    Experience AI Avatar
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default EcosystemHero;
