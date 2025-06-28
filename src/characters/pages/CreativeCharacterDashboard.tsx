
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Plus, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { cn } from '@/lib/utils';
import CreativeCharacterLibrary from './CreativeCharacterLibrary';
import CharacterHeader from '../components/CharacterHeader';
import Footer from '@/components/sections/Footer';
import { Toaster } from 'sonner';

const CreativeCharacterDashboard = () => {
  const [activeSection, setActiveSection] = useState('library');
  const location = useLocation();

  // Update active section based on current route
  useEffect(() => {
    if (location.pathname === '/characters/create/creative') {
      setActiveSection('create-creative');
    } else {
      setActiveSection('library');
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: 'create-creative',
      title: 'Create Creative Character',
      icon: Sparkles,
      href: '/characters/create/creative'
    },
    {
      id: 'library',
      title: 'Creative Character Library',
      icon: Library,
      href: '/characters/creative'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CharacterHeader />
      <main className="flex-grow">
        <div className="flex pt-20">
          {/* Left Sidebar */}
          <div className="w-64 bg-card border-r border-border p-6">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">Creative Characters</h2>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Show Creative Character Library when on main creative characters route */}
            {location.pathname === '/characters/creative' ? (
              <CreativeCharacterLibrary />
            ) : (
              <div className="container mx-auto px-4 py-8">
                <Section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-8 w-8 text-primary" />
                      <div>
                        <h1 className="text-3xl font-bold">Creative Characters Dashboard</h1>
                        <p className="text-muted-foreground">Design and manage your original fictional characters</p>
                      </div>
                    </div>
                  </div>

                  {/* Creative Character Creation Option */}
                  <div className="grid grid-cols-1 gap-6 mb-8">
                    <Card className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-semibold">Creative Characters</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Design original fictional characters with custom traits, creative backgrounds, and unique personalities.
                      </p>
                      <Button asChild className="w-full">
                        <Link to="/characters/create/creative">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create Creative Character
                        </Link>
                      </Button>
                    </Card>
                  </div>

                  {/* Library Preview */}
                  <Card className="text-center py-12">
                    <Library className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Creative Character Library</h2>
                    <p className="text-muted-foreground mb-6">
                      View and manage all your creative characters
                    </p>
                    <Button asChild>
                      <Link to="/characters/creative">
                        <Library className="h-4 w-4 mr-2" />
                        View Creative Character Library
                      </Link>
                    </Button>
                  </Card>
                </Section>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default CreativeCharacterDashboard;
