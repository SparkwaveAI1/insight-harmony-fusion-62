
import { Link } from "react-router-dom";
import { ArrowRight, Rocket, Lightbulb, Lock, TrendingUp, HandCoins, Coins, Zap, LineChart } from "lucide-react";
import Section from "../ui-custom/Section";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const TokenEcosystem = () => {
  return (
    <Section className="bg-gradient-to-br from-blue-900 to-slate-900 text-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center justify-center bg-primary/20 px-4 py-2 rounded-full mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
              <Rocket className="h-5 w-5 text-white mr-2" />
              <span className="text-sm font-medium text-white">Web3 Research Layer</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-plasmik">
              $PRSNA — The Research Layer for Web3
            </h2>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-gray-300 text-pretty mb-10 max-w-2xl mx-auto text-lg">
              $PRSNA is the native token powering AI-driven qualitative research across Web3 and beyond. 
              It's your key to unlocking access to custom personas, premium insights, and future rewards 
              for contributing to next-gen market intelligence.
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/prsna-ecosystem">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 border-none w-60 h-14 text-lg shadow-lg hover:shadow-blue-600/30 transition-all"
                >
                  Connect Wallet
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/earn-prsna">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="group w-60 h-14 text-lg"
                >
                  <HandCoins className="w-5 h-5 mr-2" />
                  Earn $PRSNA
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 ml-2" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
        
        <Reveal delay={400}>
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">🎯 What's Live Now</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-400 text-xl font-bold mr-2">✅</span>
                  <div>
                    <p className="font-semibold mb-1">Contribute Interviews and Surveys</p>
                    <p className="text-gray-300">Help build the first generation of AI Personas. Your insights shape how they think.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 text-xl font-bold mr-2">✅</span>
                  <div>
                    <p className="font-semibold mb-1">Hold $PRSNA to Support the Ecosystem</p>
                    <p className="text-gray-300">Early holders gain priority access as new features roll out.</p>
                  </div>
                </li>
              </ul>
              
              <h3 className="text-2xl font-bold mb-6">🔐 Coming Soon</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-blue-400 text-xl font-bold mr-2">🔄</span>
                  <div>
                    <p className="font-semibold mb-1">Staking & Reward Access</p>
                    <p className="text-gray-300">Stake $PRSNA to earn research rewards and unlock advanced tools.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 text-xl font-bold mr-2">🧠</span>
                  <div>
                    <p className="font-semibold mb-1">Persona Ownership</p>
                    <p className="text-gray-300">Keep and use the AI Personas you help create—for business or personal use.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 text-xl font-bold mr-2">💬</span>
                  <div>
                    <p className="font-semibold mb-1">Talk to the PersonaAI Agent</p>
                    <p className="text-gray-300">Interact with AI Personas to test ideas, simulate decisions, and extract insights.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 text-xl font-bold mr-2">📈</span>
                  <div>
                    <p className="font-semibold mb-1">Premium AI Intelligence</p>
                    <p className="text-gray-300">Access sentiment analysis and behavioral data from across DeFi, DAOs, and NFT communities.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
        
        {/* AI Avatar Preview */}
        <Reveal delay={500}>
          <div className="mt-12 p-6 bg-gradient-to-br from-blue-900/50 to-slate-800/50 border border-blue-500/20 rounded-2xl max-w-2xl mx-auto shadow-lg">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI Avatar Agent</h3>
            </div>
            <p className="text-gray-300 mb-4">Talk to our AI research agent to explore market insights and token utility</p>
            <div className="flex justify-center">
              <Link to="/prsna-ecosystem">
                <Button 
                  variant="secondary" 
                  className="group bg-blue-600/20 hover:bg-blue-600/30 text-white border-blue-500/30 shadow-md"
                >
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
