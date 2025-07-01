
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui-custom/Logo';
import ActionButtons from '@/components/layout/navigation/ActionButtons';

const CharacterHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              className="text-gray-300 hover:text-white transition-colors"
            >
              Character Lab
            </Link>
            <Link 
              to="/characters" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Historical Characters
            </Link>
          </nav>

          {/* Right side - Login/Auth + Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Auth buttons - hidden on mobile */}
            <div className="hidden md:block">
              <ActionButtons isDarkRoute={true} />
            </div>

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
                className="block text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Character Lab
              </Link>
              <Link 
                to="/characters" 
                className="block text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Historical Characters
              </Link>
              
              {/* Auth buttons in mobile menu */}
              <div className="pt-4 border-t border-slate-700">
                <ActionButtons isDarkRoute={true} />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default CharacterHeader;
