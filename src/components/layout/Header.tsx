
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "../ui-custom/Logo";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import ActionButtons from "./navigation/ActionButtons";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { User, Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
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

  const navigationLinks = [
    { title: "Research", href: "/research" },
    { title: "Interviewer", href: "/interviewer" },
    { title: "Personas", href: "/persona-viewer" },
    { title: "Pricing", href: "/pricing" },
    { title: "Contact", href: "/contact" },
  ];
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
          
          {/* Navigation Links - Desktop */}
          <NavigationMenu className="hidden md:flex ml-6">
            <NavigationMenuList>
              {navigationLinks.map((link) => (
                <NavigationMenuItem key={link.title}>
                  <Link to={link.href}>
                    <NavigationMenuLink className={cn(
                      navigationMenuTriggerStyle(),
                      "text-sm",
                      isScrolled ? "text-foreground" : "text-white"
                    )}>
                      {link.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Action Buttons (right side) - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <ActionButtons 
            isEarnPage={isEarnPage}
            isWalletConnected={isWalletConnected}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
          />
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button size="sm" variant="outline" className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 border-none">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 py-4">
          <div className="container">
            <nav className="flex flex-col gap-3">
              {navigationLinks.map((link) => (
                <Link 
                  key={link.title} 
                  to={link.href} 
                  className="text-white hover:text-primary px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="mt-4 flex flex-col gap-2">
                <ActionButtons 
                  isEarnPage={isEarnPage}
                  isWalletConnected={isWalletConnected}
                  connectWallet={connectWallet}
                  disconnectWallet={disconnectWallet}
                  className="w-full"
                />
                
                {user ? (
                  <>
                    <Link to="/dashboard" className="w-full">
                      <Button size="sm" variant="outline" className="w-full border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800" 
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-gradient-to-r from-primary to-primary/80 border-none">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
