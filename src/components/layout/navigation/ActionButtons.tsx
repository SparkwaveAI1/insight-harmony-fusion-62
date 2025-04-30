
import React from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  isWalletConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  className?: string;
  showWalletOptions?: boolean; // New prop to control wallet button visibility
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isWalletConnected,
  connectWallet,
  disconnectWallet,
  className,
  showWalletOptions = false // Default to not showing wallet options
}) => {
  return (
    <div className={className}>
      {showWalletOptions && (
        <>
          {isWalletConnected ? (
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800"
              onClick={disconnectWallet}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button 
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 border-none"
              onClick={connectWallet}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default ActionButtons;
