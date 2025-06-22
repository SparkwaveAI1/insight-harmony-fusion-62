
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';

const CharacterDashboard = () => {
  const [characters] = useState([]); // Will connect to service later

  return (
    <div className="min-h-screen bg-background">
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
            
            <Button asChild>
              <Link to="/characters/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Character
              </Link>
            </Button>
          </div>

          {/* Empty state for now */}
          <Card className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Characters Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first character to get started
            </p>
            <Button asChild>
              <Link to="/characters/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Character
              </Link>
            </Button>
          </Card>
        </Section>
      </div>
    </div>
  );
};

export default CharacterDashboard;
