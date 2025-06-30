import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Book, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import CharacterHeader from '../components/CharacterHeader';
import Footer from '@/components/sections/Footer';
import { Toaster } from 'sonner';

const CharacterDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CharacterHeader />
      <main className="flex-grow">
        <div className="flex pt-20">
          {/* Left Sidebar (Hidden on small screens) */}
          <aside className="hidden md:block w-64 bg-card border-r border-border p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold">Character Options</h2>
              <p className="text-sm text-muted-foreground">Explore different character types</p>
            </div>
            <nav className="space-y-2">
              <Link to="/characters" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary">
                <Brain className="h-4 w-4" />
                <span>Historical Characters</span>
              </Link>
              <Link to="/characters/creative" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary">
                <Sparkles className="h-4 w-4" />
                <span>Creative Characters</span>
              </Link>
              <Link to="/characters/fictional" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary">
                <Book className="h-4 w-4" />
                <span>Fictional Characters</span>
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full overflow-x-hidden">
            {/* Mobile Navigation (Visible on small screens) */}
            <div className="md:hidden px-4 py-4 border-b bg-card">
              <h2 className="text-lg font-semibold">Character Options</h2>
              <p className="text-sm text-muted-foreground">Explore different character types</p>
              <div className="flex items-center justify-between mt-2">
                <Link to="/characters" className="text-sm">Historical Characters</Link>
                <Link to="/characters/creative" className="text-sm">Creative Characters</Link>
                <Link to="/characters/fictional" className="text-sm">Fictional Characters</Link>
              </div>
            </div>

            <div className="w-full px-4 md:px-8 py-8">
              <Section>
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <div>
                      <h1 className="text-xl md:text-3xl font-bold">Character Dashboard</h1>
                      <p className="text-sm md:text-base text-muted-foreground">Explore and manage your characters</p>
                    </div>
                  </div>
                </div>

                {/* Character Creation Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Historical Characters */}
                  <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      <h3 className="text-lg md:text-xl font-semibold">Historical Characters</h3>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Create characters based on historical figures with accurate traits and behaviors.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/characters/create/historical">
                        <Brain className="h-4 w-4 mr-2" />
                        Create Historical Character
                      </Link>
                    </Button>
                  </Card>
                  
                  {/* Character Lab Card */}
                  <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      <h3 className="text-lg md:text-xl font-semibold">Character Lab</h3>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Experiment with original fictional characters featuring custom traits, imaginative backgrounds, and unique personalities.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/characters/lab">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Enter Character Lab
                      </Link>
                    </Button>
                  </Card>
                </div>

                {/* Fictional Character Creation Option */}
                <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <Book className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <h3 className="text-lg md:text-xl font-semibold">Fictional Characters</h3>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Design original fictional characters with custom traits, creative backgrounds, and unique personalities.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/characters/fictional">
                      <Book className="h-4 w-4 mr-2" />
                      Create Fictional Character
                    </Link>
                  </Button>
                </Card>
              </Section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default CharacterDashboard;
