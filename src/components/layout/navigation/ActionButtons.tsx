
import React from "react";
import { Wallet, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  isWalletConnected?: boolean;
  connectWallet?: () => void;
  disconnectWallet?: () => void;
  className?: string;
  showWalletOptions?: boolean;
  isDarkRoute?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isWalletConnected,
  connectWallet,
  disconnectWallet,
  className,
  showWalletOptions = false,
  isDarkRoute = false
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
              className={cn(
                "border-gray-300 text-foreground hover:bg-gray-100",
                "bg-white/80"
              )}
              onClick={disconnectWallet}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button 
              size="sm"
              className={cn(
                "border-none hover:opacity-90",
                "bg-gradient-to-r from-primary to-primary/80 text-foreground"
              )}
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
          className={cn(
            "border-gray-300 text-foreground hover:bg-gray-100",
            "bg-white/80"
          )}
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      ) : (
        <Link to="/sign-in">
          <Button 
            size="sm" 
            className={cn(
              "border-none hover:opacity-90",
              "bg-gradient-to-r from-primary to-primary/80 text-foreground"
            )}
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
