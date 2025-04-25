
import { GraduationCap, HandCoins, Users } from "lucide-react";
import Reveal from "@/components/ui-custom/Reveal";

const RewardsIllustration = () => {
  return (
    <div className="w-full lg:w-1/2">
      <Reveal delay={400}>
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6">
          <div className="aspect-video bg-gray-900/80 rounded-lg flex flex-col items-center justify-center border border-gray-700 mb-6">
            <HandCoins className="h-20 w-20 text-secondary/50 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Earn While Contributing</h3>
            <p className="text-gray-400 text-center max-w-md mb-4">
              Get rewarded for helping improve AI research capabilities
            </p>
            <div className="flex items-center justify-center px-4 py-2 bg-secondary/20 rounded-full">
              <span className="text-sm font-medium text-secondary">$PRSNA Rewards</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 bg-gray-700/50 p-3 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-sm font-medium">Create AI Personas</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-700/50 p-3 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-sm font-medium">Join Focus Groups</span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default RewardsIllustration;
