
import React from "react";
import { Link } from "react-router-dom";
import { Wallet, Users } from "lucide-react";
import Button from "@/components/ui-custom/Button";

interface ActionButtonsProps {
  isEarnPage: boolean;
  isWalletConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isEarnPage,
  isWalletConnected,
  connectWallet,
  disconnectWallet,
  className
}) => {
  return (
    <div className={className}>
      {isEarnPage ? (
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
      ) : (
        <>
          <Link to="/team">
            <Button size="sm">
              <Users className="h-4 w-4 mr-1" />
              Team
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
