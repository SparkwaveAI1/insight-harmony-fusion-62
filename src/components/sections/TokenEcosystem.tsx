
import { ArrowRight, Rocket, Lightbulb, Lock, TrendingUp, HandCoins, Coins, Zap, LineChart, ExternalLink, Twitter, MessageCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";
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
            <p className="text-gray-300 text-pretty mb-8 max-w-2xl mx-auto text-lg">
              PersonaAI is live inside the Virtuals ACP, providing on-demand qualitative insights from thousands of AI personas. $PRSNA fuels realistic human simulations and is set to become a fundamental component of the Web3 research.
            </p>
          </Reveal>
          
          {/* Action buttons */}
          <Reveal delay={250}>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-10">
              <a href="https://app.virtuals.io/virtuals/18846" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  className="group flex items-center gap-2 w-full"
                >
                  <Coins className="h-4 w-4" />
                  Buy $PRSNA
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              
              <a href="https://x.com/PersonaAI_agent" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="group flex items-center gap-2 border-gray-500 w-full"
                >
                  <Twitter className="h-4 w-4" />
                  PersonaAI Agent on X
                </Button>
              </a>
              
              <a href="https://t.me/personaAIportal" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="group flex items-center gap-2 border-gray-500 w-full"
                >
                  <MessageCircle className="h-4 w-4" />
                  Telegram Community
                </Button>
              </a>
            </div>
          </Reveal>

          <Reveal delay={275}>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm overflow-hidden flex items-center justify-center">
                <img 
                  src="/lovable-uploads/928af4dd-ec22-412b-98e0-57d4f08eb4b2.png" 
                  alt="PersonaAI Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex justify-center mb-8">
              <Link to="/prsna">
                <Button 
                  variant="primary" 
                  className="bg-[#9b87f5] hover:bg-[#8a76e3] text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Reveal>
          
        </div>
      </div>
    </Section>
  );
};

export default TokenEcosystem;
