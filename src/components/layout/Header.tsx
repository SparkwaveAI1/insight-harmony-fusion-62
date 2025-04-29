
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "../ui-custom/Logo";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import ActionButtons from "./navigation/ActionButtons";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isWalletConnected, connectWallet, disconnectWallet } = useWeb3Wallet();
  const isEarnPage = location.pathname === "/earn-prsna" || location.pathname === "/prsna-ecosystem";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled 
          ? "bg-background/95 backdrop-blur-md shadow-md" 
          : "bg-slate-900/90 backdrop-blur-md"
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Logo 
              size="md" 
              className={isScrolled ? "text-foreground" : "text-white"}
            />
          </Link>
        </div>

        {/* Action Buttons (right side) */}
        <div className="flex items-center">
          <ActionButtons 
            isEarnPage={isEarnPage}
            isWalletConnected={isWalletConnected}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
