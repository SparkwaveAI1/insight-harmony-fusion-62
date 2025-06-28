
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Sparkles } from 'lucide-react';
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
              Design, manage, and chat with historical and fictional characters
            </p>
          </div>
        </div>
      </Section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Character Types Section */}
        <Section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Character Type</h2>
            <p className="text-lg text-muted-foreground">
              Create different types of characters for various purposes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Historical Characters */}
            <div 
              className="cursor-pointer" 
              onClick={() => navigate('/characters/create/historical')}
            >
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Historical Characters</h3>
                  <p className="text-muted-foreground mb-6">
                    Create characters based on real historical figures with accurate cultural context, 
                    period-appropriate traits, and historical authenticity.
                  </p>
                  <Button className="w-full">
                    Create Historical Character
                  </Button>
                </div>
              </Card>
            </div>

            {/* Creative Characters */}
            <div 
              className="cursor-pointer"
              onClick={() => navigate('/characters/create/creative')}
            >
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Creative Characters</h3>
                  <p className="text-muted-foreground mb-6">
                    Design original characters from any genre, species, or universe. Perfect for 
                    fantasy, sci-fi, and imaginative storytelling.
                  </p>
                  <Button className="w-full">
                    Create Creative Character
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Character Library Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Explore Your Character Library</h2>
            <p className="text-lg text-muted-foreground mb-8">
              View, manage, and interact with all your created characters
            </p>
            <Button onClick={() => navigate('/characters')}>
              Go to Character Library
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default CharactersHome;
