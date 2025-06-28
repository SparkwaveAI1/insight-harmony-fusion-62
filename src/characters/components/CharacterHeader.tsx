
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "../../components/ui-custom/Logo";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";
import ActionButtons from "../../components/layout/navigation/ActionButtons";
import { Menu, X, LogOut, UserRound } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import MobileDrawerMenu from "../../components/navigation/MobileDrawerMenu";

const CharacterHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isWalletConnected, connectWallet, disconnectWallet } = useWeb3Wallet();
  const { user, signOut } = useAuth();

  // Character navigation items
  const characterNavItems = [
    {
      title: "Character Dashboard",
      href: "/characters",
    },
    {
      title: "Create Historical",
      href: "/characters/create/historical",
    },
    {
      title: "Create Fictional",
      href: "/characters/create/fictional",
    },
  ];

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
        <div className="flex items-center gap-2">
          <Link to="/characters-home" className="flex items-center">
            <Logo 
              size="md" 
              className={isScrolled ? "text-foreground" : "text-white"}
            />
          </Link>
        </div>
          
        {/* Centered Navigation Links - Desktop */}
        <NavigationMenu className="hidden md:flex mx-auto">
          <NavigationMenuList className="space-x-2">
            {/* Character Navigation Links */}
            {characterNavItems.map((link) => {
              const isActive = location.pathname === link.href || 
                             (link.href !== "/" && location.pathname.startsWith(link.href));
              
              return (
                <NavigationMenuItem key={link.title}>
                  <Link to={link.href}>
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "flex items-center gap-2 px-4 font-medium",
                        "text-foreground",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
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
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
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
              showWalletOptions={false}
              isWalletConnected={isWalletConnected}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
              isDarkRoute={!isScrolled}
            />
          </div>
          
          <Button 
            className={cn(
              "md:hidden",
              "text-foreground",
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

export default CharacterHeader;
