
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "../ui-custom/Logo";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import ActionButtons from "./navigation/ActionButtons";
import { Menu, X, User, LayoutDashboard, BadgeDollarSign } from "lucide-react";
import { Button } from "../ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { navigationItems } from "./navigation/NavigationItems";

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

  const navigationLinks = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "$PRSNA", href: "/prsna", icon: BadgeDollarSign },
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
        </div>
          
        {/* Centered Navigation Links - Desktop */}
        <NavigationMenu className="hidden md:flex mx-auto">
          <NavigationMenuList className="space-x-4">
            {/* Primary Navigation Links */}
            {navigationLinks.map((link) => (
              <NavigationMenuItem key={link.title}>
                <Link to={link.href}>
                  <NavigationMenuLink className={cn(
                    navigationMenuTriggerStyle(),
                    "text-sm font-medium text-foreground hover:text-foreground/80"
                  )}>
                    {link.icon && <link.icon className="w-4 h-4 mr-2" />}
                    {link.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
            
            {/* Products Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm font-medium">Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  <Link to="/simulated-persona" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Generate AI Personas</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Create behaviorally accurate AI personas
                    </p>
                  </Link>
                  <Link to="/persona-viewer" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Persona Library</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Browse and view generated personas
                    </p>
                  </Link>
                  <Link to="/dual-chat" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Chat with Personas</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Interact with AI personas in conversation
                    </p>
                  </Link>
                  <Link to="/interviewer" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Interview System</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Conduct automated interview sessions
                    </p>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
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
              {navigationLinks.map((link) => (
                <Link 
                  key={link.title} 
                  to={link.href} 
                  className="text-foreground hover:text-primary px-2 py-1 flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon && <link.icon className="w-4 h-4 mr-2" />}
                  {link.title}
                </Link>
              ))}
              
              {/* Mobile Products Links */}
              <div className="px-2 py-2">
                <div className="font-medium text-foreground mb-1">Products</div>
                <div className="pl-2 flex flex-col gap-2">
                  <Link 
                    to="/simulated-persona" 
                    className="text-sm text-foreground/90 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Generate AI Personas
                  </Link>
                  <Link 
                    to="/persona-viewer" 
                    className="text-sm text-foreground/90 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Persona Library
                  </Link>
                  <Link 
                    to="/dual-chat" 
                    className="text-sm text-foreground/90 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Chat with Personas
                  </Link>
                  <Link 
                    to="/interviewer" 
                    className="text-sm text-foreground/90 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Interview System
                  </Link>
                </div>
              </div>
              
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
