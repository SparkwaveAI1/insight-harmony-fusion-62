
import { ArrowRight, Wallet } from "lucide-react";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";

type StakingPreviewProps = {
  connectWallet: () => void;
};

const StakingPreview = ({ connectWallet }: StakingPreviewProps) => {
  return (
    <Section className="bg-gray-800">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl font-bold mb-6">
              Stake $PRSNA to Access AI Research
            </h2>
          </Reveal>
          
          <Reveal delay={100}>
            <p className="text-gray-400 max-w-2xl mx-auto mb-10">
              Stake your $PRSNA tokens to earn rewards and access exclusive research insights.
              The longer you stake, the greater your research access and benefits.
            </p>
          </Reveal>
          
          <Reveal delay={200}>
            <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-700 p-8 mb-8 relative overflow-hidden">
              <img 
                src="/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png" 
                alt="Staking Dashboard Preview" 
                className="rounded-lg w-full h-auto max-h-[400px] object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                <h3 className="text-xl font-bold mb-2">AI Research Access Tiers</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-2 bg-gray-800/80 rounded-lg border border-gray-700">
                    <p className="font-semibold text-primary">Bronze</p>
                    <p className="text-xs text-gray-400">Basic AI insights</p>
                  </div>
                  <div className="p-2 bg-gray-800/80 rounded-lg border border-primary/50">
                    <p className="font-semibold text-primary">Silver</p>
                    <p className="text-xs text-gray-400">Advanced research</p>
                  </div>
                  <div className="p-2 bg-gray-800/80 rounded-lg border border-gray-700">
                    <p className="font-semibold text-primary">Gold</p>
                    <p className="text-xs text-gray-400">Premium AI features</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
          
          <Reveal delay={300}>
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
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default StakingPreview;
