
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "../ui-custom/Logo";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import ActionButtons from "./navigation/ActionButtons";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isWalletConnected, connectWallet, disconnectWallet } = useWeb3Wallet();
  const { user, signOut } = useAuth();
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

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleLogin = () => {
    navigate('/auth');
  };

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
        <div className="flex items-center gap-4">
          {user ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-300 hover:bg-gray-800" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            location.pathname !== '/auth' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-300 hover:bg-gray-800" 
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )
          )}

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
