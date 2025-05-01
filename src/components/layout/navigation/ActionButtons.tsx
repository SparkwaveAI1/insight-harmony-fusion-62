
import React from "react";
import { Wallet, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ActionButtonsProps {
  isWalletConnected?: boolean;
  connectWallet?: () => void;
  disconnectWallet?: () => void;
  className?: string;
  showWalletOptions?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isWalletConnected,
  connectWallet,
  disconnectWallet,
  className,
  showWalletOptions = false
}) => {
  const { user, signOut } = useAuth();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showWalletOptions && (
        <>
          {isWalletConnected ? (
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-300 text-foreground bg-white/80 hover:bg-gray-100"
              onClick={disconnectWallet}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button 
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 border-none text-foreground hover:opacity-90"
              onClick={connectWallet}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </>
      )}

      {/* Auth buttons - always show these */}
      {user ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-gray-300 text-foreground bg-white/80 hover:bg-gray-100"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      ) : (
        <Link to="/auth">
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-primary/80 border-none text-foreground hover:opacity-90"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
};

export default ActionButtons;
