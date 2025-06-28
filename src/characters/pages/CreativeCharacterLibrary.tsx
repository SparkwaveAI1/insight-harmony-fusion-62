
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';

const CreativeCharacterLibrary = () => {
  // TODO: This will connect to Creative Characters service when backend is ready
  const creativeCharacters = []; // Empty for now since no backend exists yet

  return (
    <div className="container mx-auto px-4 py-8">
      <Section>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Creative Character Library</h1>
            <p className="text-muted-foreground">
              Browse and manage your original creative characters
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link to="/characters/create/creative">
                <Plus className="h-4 w-4 mr-2" />
                Create Creative Character
              </Link>
            </Button>
          </div>
        </div>

        {/* Empty State - Since no backend exists yet */}
        <Card className="text-center py-12">
          <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Creative Characters Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start creating your first original creative character with custom traits and personalities.
          </p>
          <Button asChild>
            <Link to="/characters/create/creative">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Your First Creative Character
            </Link>
          </Button>
        </Card>
      </Section>
    </div>
  );
};

export default CreativeCharacterLibrary;
