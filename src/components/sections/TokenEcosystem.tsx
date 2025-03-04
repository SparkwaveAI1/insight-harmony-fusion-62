
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Rocket } from "lucide-react";
import Section from "../ui-custom/Section";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const TokenEcosystem = () => {
  return (
    <Section className="bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center justify-center bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Rocket className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Web3 Powered</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">
              The $PRSNA Token Ecosystem—AI-Powered Research Meets Web3.
            </h2>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-muted-foreground text-pretty mb-10 max-w-2xl mx-auto">
              $PRSNA fuels the world's first AI-powered qualitative research ecosystem. 
              Explore staking, Web3 intelligence, and decentralized insights—all in one place.
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <Link to="/prsna-ecosystem">
              <Button 
                variant="primary" 
                size="lg" 
                className="group"
              >
                Open App
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </Reveal>
        </div>
        
        <Reveal delay={400}>
          <div className="mt-16 bg-white/50 border border-primary/10 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4 shrink-0">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Staking & Rewards</h3>
                  <p className="text-sm text-muted-foreground">
                    Stake $PRSNA tokens to earn rewards and gain access to exclusive research insights and governance.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4 shrink-0">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Web3 Intelligence</h3>
                  <p className="text-sm text-muted-foreground">
                    Access AI-powered market sentiment tracking across DAOs, DeFi, and NFT projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

export default TokenEcosystem;
