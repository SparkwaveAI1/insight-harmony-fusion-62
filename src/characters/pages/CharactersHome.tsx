
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Sparkles, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';

const CharactersHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
              Character Creation & Management
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-8">
              Design, manage, and chat with historical characters
            </p>
          </div>
        </div>
      </Section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Character Dashboards Section */}
        <Section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Character Dashboard</h2>
            <p className="text-lg text-muted-foreground">
              Manage your historical characters
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Historical Characters Dashboard */}
            <div 
              className="cursor-pointer" 
              onClick={() => navigate('/characters/historical')}
            >
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Historical Characters</h3>
                  <p className="text-muted-foreground mb-6">
                    View and manage all your historical characters in one place. Based on real 
                    historical figures with authentic cultural context and period-appropriate traits.
                  </p>
                  <Button className="w-full">
                    View Historical Dashboard
                  </Button>
                </div>
              </Card>
            </div>

            {/* Creative Characters Dashboard */}
            <div 
              className="cursor-pointer" 
              onClick={() => navigate('/characters/creative')}
            >
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Creative Characters</h3>
                  <p className="text-muted-foreground mb-6">
                    Create and manage original characters from any genre, species, or universe. 
                    Design unique personalities with custom traits and backstories.
                  </p>
                  <Button className="w-full">
                    View Creative Dashboard
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Create new characters or browse your complete library
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => navigate('/characters/create/historical')}>
                <Clock className="h-4 w-4 mr-2" />
                Create Historical Character
              </Button>
              <Button onClick={() => navigate('/characters/create/creative')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Creative Character
              </Button>
              <Button variant="outline" onClick={() => navigate('/characters')}>
                <Library className="h-4 w-4 mr-2" />
                Browse All Characters
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default CharactersHome;
