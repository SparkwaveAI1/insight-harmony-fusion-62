
import { Link } from "react-router-dom";
import { ArrowRight, Rocket, Lightbulb, Lock, TrendingUp, HandCoins } from "lucide-react";
import Section from "../ui-custom/Section";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const TokenEcosystem = () => {
  return (
    <Section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center justify-center bg-primary/20 px-4 py-2 rounded-full mb-6">
              <Rocket className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Base Chain Powered</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">
              $PRSNA — Research Layer for Web3
            </h2>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-gray-300 text-pretty mb-10 max-w-2xl mx-auto">
              $PRSNA fuels the first AI-powered qualitative research ecosystem. 
              Stake to access exclusive insights, Web3 intelligence, and research tools.
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/prsna-ecosystem">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="group bg-gradient-to-r from-primary to-primary/80 border-none"
                >
                  Connect Wallet
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/earn-prsna">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="group"
                >
                  <HandCoins className="w-4 h-4 mr-2" />
                  Earn $PRSNA
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
        
        <Reveal delay={400}>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 mr-4 shrink-0">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Staking & Research Rewards</h3>
                  <p className="text-sm text-gray-300">
                    Stake $PRSNA to unlock premium AI-generated insights, participate in focus groups, and earn staking rewards. The longer you stake, the greater your access to cutting-edge AI research.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 mr-4 shrink-0">
                  <HandCoins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Earn $PRSNA Tokens</h3>
                  <p className="text-sm text-gray-300">
                    Create your own AI personas for research or participate in AI-powered focus groups to earn $PRSNA tokens. Help shape the future of AI research while getting rewarded.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 mr-4 shrink-0">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Web3 Research & AI Insights</h3>
                  <p className="text-sm text-gray-300">
                    Gain access to AI-powered market intelligence, tracking sentiment across DAOs, DeFi, and NFT ecosystems. Stakers unlock premium insights from AI personas and real-world research.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 mr-4 shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Token Utility & Research Access</h3>
                  <p className="text-sm text-gray-300">
                    $PRSNA fuels AI-driven market intelligence. Token holders gain access to exclusive research insights, AI-generated intelligence, and staking rewards. Holding and staking $PRSNA unlocks premium data and participation in next-gen AI research.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        
        {/* AI Avatar Preview */}
        <Reveal delay={500}>
          <div className="mt-12 p-6 bg-gray-800/80 border border-gray-700 rounded-2xl max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold">AI Avatar Agent</h3>
            </div>
            <p className="text-gray-300 mb-4">Talk to our AI research agent to explore market insights and token utility</p>
            <div className="flex justify-center">
              <Link to="/prsna-ecosystem">
                <Button variant="secondary" className="group">
                  Meet the AI Agent
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

export default TokenEcosystem;
