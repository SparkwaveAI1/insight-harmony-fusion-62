
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
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { navigationMenuItems } from "./config/navigationConfig";
import MobileDrawerMenu from "../navigation/MobileDrawerMenu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isWalletConnected, connectWallet, disconnectWallet } = useWeb3Wallet();
  // We'll only show the wallet options on the ecosystem page, not the prsna page
  const isEarnPage = location.pathname === "/prsna-ecosystem";
  
  // Check if we're on a route that needs dark styling
  const isDarkRoute = location.pathname === "/" || 
                     location.pathname === "/prsna-ecosystem";

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

  // Use navigation items for the header - correctly ordered
  const headerNavItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "My Personas", href: "/my-personas", icon: User },
    { title: "Projects", href: "/projects", icon: LayoutDashboard },
    { title: "Collections", href: "/collections", icon: User },
    { title: "Persona Library", href: "/persona-viewer", icon: User },
    { title: "$PRSNA", href: "/prsna-ecosystem", icon: BadgeDollarSign },
  ];
  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled || !isDarkRoute
          ? "bg-background/95 backdrop-blur-md shadow-md" 
          : "bg-slate-900/90 backdrop-blur-md"
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <Logo 
              size="md" 
              className={isScrolled || !isDarkRoute ? "text-foreground" : "text-white"}
            />
          </Link>
        </div>
          
        {/* Centered Navigation Links - Desktop */}
        <NavigationMenu className="hidden md:flex mx-auto">
          <NavigationMenuList className="space-x-2">
            {/* Primary Navigation Links */}
            {headerNavItems.map((link) => {
              const isActive = location.pathname === link.href || 
                             (link.href !== "/" && location.pathname.startsWith(link.href));
              
              return (
                <NavigationMenuItem key={link.title}>
                  <Link to={link.href}>
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "flex items-center gap-2 px-4 font-medium",
                        // Use appropriate text color
                        isDarkRoute && !isScrolled ? "text-white" : "text-foreground",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      {link.icon && <link.icon className="w-4 h-4" />}
                      {link.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2">
          {/* Action Buttons (right side) - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <ActionButtons 
              showWalletOptions={isEarnPage}
              isWalletConnected={isWalletConnected}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
              isDarkRoute={isDarkRoute && !isScrolled}
            />
          </div>
          
          <Button 
            className={cn(
              "md:hidden",
              // Use appropriate text color based on the route/scroll state
              isDarkRoute && !isScrolled ? "text-white" : "text-foreground",
              "p-2"
            )} 
            variant="ghost"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>
      
      {/* Mobile Drawer Menu */}
      <MobileDrawerMenu 
        open={mobileMenuOpen} 
        onOpenChange={setMobileMenuOpen} 
      />
    </header>
  );
};

export default Header;
