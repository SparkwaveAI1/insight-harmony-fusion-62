
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "../ui-custom/Logo";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import ActionButtons from "./navigation/ActionButtons";
import { Menu, X } from "lucide-react";
import { navigationMenuItems } from "./config/navigationConfig";
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
  // We'll only show the wallet options on the ecosystem page, not the prsna page
  const isEarnPage = location.pathname === "/prsna-ecosystem";

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
        </div>
          
        {/* Centered Navigation Links - Desktop */}
        <NavigationMenu className="hidden md:flex mx-auto">
          <NavigationMenuList className="space-x-4">
            {navigationMenuItems.map((link) => (
              <NavigationMenuItem key={link.title}>
                <Link to={link.url}>
                  <NavigationMenuLink className={cn(
                    navigationMenuTriggerStyle(),
                    "text-sm font-medium text-foreground hover:text-foreground/80",
                    location.pathname === link.url ? "bg-accent" : ""
                  )}>
                    {link.icon && <link.icon className="w-4 h-4 mr-2" />}
                    {link.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

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
            showWalletOptions={isEarnPage}
            isWalletConnected={isWalletConnected}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
          />
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 py-4">
          <div className="container">
            <nav className="flex flex-col gap-3">
              {navigationMenuItems.map((link) => (
                <Link 
                  key={link.title} 
                  to={link.url} 
                  className="text-foreground hover:text-primary px-2 py-1 flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon && <link.icon className="w-4 h-4 mr-2" />}
                  {link.title}
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="mt-4 flex flex-col gap-2">
                <ActionButtons 
                  showWalletOptions={isEarnPage}
                  isWalletConnected={isWalletConnected}
                  connectWallet={connectWallet}
                  disconnectWallet={disconnectWallet}
                  className="w-full"
                />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
