
import { useState, useEffect } from "react";
import { Menu, X, Wallet, UserPlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Button from "../ui-custom/Button";
import Logo from "../ui-custom/Logo";
import { cn } from "@/lib/utils";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navItems = [
    { label: "Home", href: "/" },
    { label: "AI Interviewer", href: "/interviewer" },
    { label: "AI Researcher", href: "/research" },
    { label: "Web3", href: "/earn-prsna" },
    { label: "Pricing", href: "/pricing" },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    
    // If it's a hash link, handle smooth scrolling
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }
    // External links will be handled by Link component
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-b" 
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            item.href.startsWith("#") ? (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "text-sm font-medium text-foreground/80 hover:text-foreground transition-colors",
                  (item.href === '/earn-prsna' && isEarnPage) || 
                  (item.href === '/research' && location.pathname === '/research') ||
                  (item.href === '/interviewer' && location.pathname === '/interviewer') ||
                  (item.href === '/' && location.pathname === '/')
                    ? "text-primary font-bold" 
                    : ""
                )}
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isEarnPage ? (
            <>
              {isWalletConnected ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800"
                  onClick={disconnectWallet}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary/80 border-none"
                  onClick={connectWallet}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </>
          ) : (
            <>
              <Link to="/interviewer">
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Start
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background/95 backdrop-blur-md pt-20 px-6 transition-all duration-300 md:hidden",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col space-y-6">
          {navItems.map((item) => (
            item.href.startsWith("#") ? (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-xl font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "text-xl font-medium text-foreground/80 hover:text-foreground transition-colors",
                  (item.href === '/earn-prsna' && isEarnPage) || 
                  (item.href === '/research' && location.pathname === '/research') ||
                  (item.href === '/interviewer' && location.pathname === '/interviewer') ||
                  (item.href === '/' && location.pathname === '/')
                    ? "text-primary font-bold" 
                    : ""
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          ))}
          <div className="flex flex-col gap-4 pt-4">
            {isEarnPage ? (
              <>
                {isWalletConnected ? (
                  <Button 
                    variant="outline"
                    onClick={disconnectWallet}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Disconnect Wallet
                  </Button>
                ) : (
                  <Button 
                    onClick={connectWallet}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </>
            ) : (
              <>
                <Link to="/interviewer">
                  <Button className="w-full justify-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
