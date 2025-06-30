
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Users, MessageSquare, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Toaster } from 'sonner';

const PersonaDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="flex pt-20">
          {/* Left Sidebar (Hidden on small screens) */}
          <aside className="hidden md:block w-64 bg-card border-r border-border p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold">Persona Module</h2>
              <p className="text-sm text-muted-foreground">Research-grade behavioral personas</p>
            </div>
            <nav className="space-y-2">
              <Link to="/personas/create" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary">
                <Brain className="h-4 w-4" />
                <span>Create Persona</span>
              </Link>
              <Link to="/personas/viewer" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary">
                <Users className="h-4 w-4" />
                <span>Persona Viewer</span>
              </Link>
              <Link to="/personas/research" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary">
                <FlaskConical className="h-4 w-4" />
                <span>Research Sessions</span>
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full overflow-x-hidden">
            {/* Mobile Navigation (Visible on small screens) */}
            <div className="md:hidden px-4 py-4 border-b bg-card">
              <h2 className="text-lg font-semibold">Persona Module</h2>
              <p className="text-sm text-muted-foreground">Research-grade behavioral personas</p>
              <div className="flex items-center justify-between mt-2">
                <Link to="/personas/create" className="text-sm">Create</Link>
                <Link to="/personas/viewer" className="text-sm">Viewer</Link>
                <Link to="/personas/research" className="text-sm">Research</Link>
              </div>
            </div>

            <div className="w-full px-4 md:px-8 py-8">
              <Section>
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <div>
                      <h1 className="text-xl md:text-3xl font-bold">Persona Module</h1>
                      <p className="text-sm md:text-base text-muted-foreground">Research-grade behavioral personas with stable traits</p>
                    </div>
                  </div>
                </div>

                {/* Persona Module Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Create Persona */}
                  <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      <h3 className="text-lg md:text-xl font-semibold">Create Persona</h3>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Generate behaviorally realistic personas with psychologically grounded traits and consistent decision-making patterns.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/personas/create">
                        <Brain className="h-4 w-4 mr-2" />
                        Create New Persona
                      </Link>
                    </Button>
                  </Card>
                  
                  {/* Persona Viewer */}
                  <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      <h3 className="text-lg md:text-xl font-semibold">Persona Viewer</h3>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Browse and interact with existing personas. View detailed profiles, traits, and engage in conversations.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/personas/viewer">
                        <Users className="h-4 w-4 mr-2" />
                        Browse Personas
                      </Link>
                    </Button>
                  </Card>

                  {/* Research Sessions */}
                  <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <FlaskConical className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      <h3 className="text-lg md:text-xl font-semibold">Research Sessions</h3>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Conduct multi-persona research sessions with structured conversations and behavioral analysis.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/personas/research">
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Start Research
                      </Link>
                    </Button>
                  </Card>
                </div>

                {/* Additional Info */}
                <Card className="p-4 md:p-6 bg-muted/30">
                  <h3 className="text-lg font-semibold mb-3">About the Persona Module</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Research-Grade Quality</h4>
                      <p className="text-muted-foreground">Personas built with demographic distributions from Pew, WVS, and Gallup research.</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Psychological Grounding</h4>
                      <p className="text-muted-foreground">Traits include risk tolerance, trust levels, political orientation, and empathy measures.</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Consistent Behavior</h4>
                      <p className="text-muted-foreground">Nonlinear trait interactions create emergent, realistic behavioral patterns.</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Structured Data</h4>
                      <p className="text-muted-foreground">Personas stored as structured JSON for advanced research applications.</p>
                    </div>
                  </div>
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

export default PersonaDashboard;
