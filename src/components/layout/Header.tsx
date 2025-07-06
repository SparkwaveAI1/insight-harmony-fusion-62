
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "../ui-custom/Logo";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import ActionButtons from "./navigation/ActionButtons";
import { Menu, X, LogOut, UserRound } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import MobileDrawerMenu from "../navigation/MobileDrawerMenu";
import { headerNavItems } from "./config/navigationConfig";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isWalletConnected, connectWallet, disconnectWallet } = useWeb3Wallet();
  const { user, signOut } = useAuth();
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
  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || !isDarkRoute
          ? "bg-background/95 backdrop-blur-md shadow-md border-b border-border" 
          : "bg-slate-900/95 backdrop-blur-md border-b border-slate-800"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center">
              <Logo 
                size="md" 
                className={isScrolled || !isDarkRoute ? "text-foreground" : "text-white"}
                textClassName={isScrolled || !isDarkRoute ? "text-foreground" : "text-white"}
              />
            </Link>
          </div>
            
          {/* Centered Navigation Links - Desktop */}
          <nav className="hidden md:flex mx-auto font-orbitron">
            <div className="flex items-center space-x-8">
              {/* Primary Navigation Links */}
              {headerNavItems.map((link) => {
                const isActive = location.pathname === link.href || 
                               (link.href !== "/" && location.pathname.startsWith(link.href));
                
                // Update the display text based on the title
                let displayText = link.title;
                if (link.title === "Personas") {
                  displayText = "Persona Lab";
                }
                
                return (
                  <Link 
                    key={link.title}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 font-medium font-orbitron transition-colors",
                      isScrolled || !isDarkRoute 
                        ? "text-foreground hover:text-primary" 
                        : "text-gray-300 hover:text-white",
                      isActive && (isScrolled || !isDarkRoute 
                        ? "text-primary" 
                        : "text-white")
                    )}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {displayText}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {/* Action Buttons (right side) - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={cn(
                          isScrolled || !isDarkRoute 
                            ? "bg-primary/20 text-foreground border border-primary/30"
                            : "bg-primary/20 text-white border border-primary/30"
                        )}>
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="font-medium">{user.email}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <UserRound className="mr-2 h-4 w-4" />
                        <span>Your Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
                isScrolled || !isDarkRoute ? "text-foreground" : "text-white",
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
