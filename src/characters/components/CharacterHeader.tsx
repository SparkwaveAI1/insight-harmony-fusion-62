
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, LogOut, UserRound, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui-custom/Logo';
import ActionButtons from '@/components/layout/navigation/ActionButtons';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const CharacterHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Links to main homepage */}
          <Link to="/" className="flex items-center">
            <Logo size="md" className="text-white" textClassName="text-white" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 font-orbitron">
            <Link 
              to="/characters-home" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link 
              to="/characters/creative" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <FlaskConical className="h-4 w-4" />
              Character Lab
            </Link>
            <Link 
              to="/characters" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Historical Characters
            </Link>
          </nav>

          {/* Right side - User Profile + Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* User Profile Dropdown - Desktop */}
            {user && (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-white border border-primary/30">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="font-medium text-foreground">
                      {user.email}
                    </DropdownMenuItem>
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
              </div>
            )}
            
            {/* Auth buttons for non-authenticated users - Desktop */}
            {!user && (
              <div className="hidden md:block">
                <ActionButtons isDarkRoute={true} />
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 border-t border-slate-800">
            <nav className="px-4 py-4 space-y-2 font-orbitron">
              <Link 
                to="/characters-home" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link 
                to="/characters/creative" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FlaskConical className="h-4 w-4" />
                Character Lab
              </Link>
              <Link 
                to="/characters" 
                className="block text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Historical Characters
              </Link>
              
              {/* User info and auth buttons in mobile menu */}
              <div className="pt-4 border-t border-slate-700">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 py-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/20 text-white border border-primary/30 text-xs">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-300 text-sm">{user.email}</span>
                    </div>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserRound className="h-4 w-4" />
                      Your Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors py-2 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                ) : (
                  <ActionButtons isDarkRoute={true} />
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default CharacterHeader;
