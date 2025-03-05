
import { BarChart3, Wallet } from "lucide-react";
import Reveal from "@/components/ui-custom/Reveal";

type DashboardHeaderProps = {
  title: string;
  description: string;
  walletAddress?: string;
};

const DashboardHeader = ({ title, description, walletAddress }: DashboardHeaderProps) => {
  return (
    <Reveal>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-400">
            {description}
          </p>
        </div>
        {walletAddress && (
          <div className="mt-4 sm:mt-0 px-4 py-2 bg-gray-800 rounded-lg flex items-center border border-gray-700">
            <Wallet className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium truncate max-w-[150px]">
              {walletAddress}
            </span>
          </div>
        )}
      </div>
    </Reveal>
  );
};

export default DashboardHeader;
