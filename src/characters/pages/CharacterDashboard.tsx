
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Plus, Library, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { cn } from '@/lib/utils';
import CharacterLibrary from './CharacterLibrary';
import CharacterHeader from '../components/CharacterHeader';
import Footer from '@/components/sections/Footer';
import { Toaster } from 'sonner';

const CharacterDashboard = () => {
  const [activeSection, setActiveSection] = useState('library');
  const location = useLocation();

  // Update active section based on current route
  useEffect(() => {
    if (location.pathname === '/characters/create/historical') {
      setActiveSection('create-historical');
    } else {
      setActiveSection('library');
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: 'create-historical',
      title: 'Create Historical Character',
      icon: Clock,
      href: '/characters/create/historical'
    },
    {
      id: 'library',
      title: 'All Characters',
      icon: Library,
      href: '/characters'
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
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">Characters</h2>
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
            {/* Show Character Library when on main characters route */}
            {location.pathname === '/characters' ? (
              <CharacterLibrary />
            ) : (
              <div className="container mx-auto px-4 py-8">
                <Section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <h1 className="text-3xl font-bold">Character Dashboard</h1>
                        <p className="text-muted-foreground">Manage your custom characters</p>
                      </div>
                    </div>
                  </div>

                  {/* Character Creation Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <Clock className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-semibold">Historical Characters</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Create characters based on real historical figures with detailed biographical information.
                      </p>
                      <Button asChild className="w-full">
                        <Link to="/characters/create/historical">
                          <Clock className="h-4 w-4 mr-2" />
                          Create Historical Character
                        </Link>
                      </Button>
                    </Card>

                    <Card className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <Plus className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-semibold">Creative Characters</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Design original fictional characters with custom traits and unique personalities.
                      </p>
                      <Button asChild className="w-full">
                        <Link to="/characters/create/creative">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Creative Character
                        </Link>
                      </Button>
                    </Card>
                  </div>

                  {/* Library Preview */}
                  <Card className="text-center py-12">
                    <Library className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Character Library</h2>
                    <p className="text-muted-foreground mb-6">
                      View and manage all your created characters (Historical and Creative)
                    </p>
                    <Button asChild>
                      <Link to="/characters">
                        <Library className="h-4 w-4 mr-2" />
                        View All Characters
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

export default CharacterDashboard;
