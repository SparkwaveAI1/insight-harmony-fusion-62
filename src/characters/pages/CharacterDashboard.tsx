
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { cn } from '@/lib/utils';

const CharacterDashboard = () => {
  const [characters] = useState([]); // Will connect to service later
  const [activeSection, setActiveSection] = useState('library');

  const menuItems = [
    {
      id: 'create',
      title: 'Create Character',
      icon: Plus,
      href: '/characters/create'
    },
    {
      id: 'library',
      title: 'Character Library',
      icon: Library,
      href: '/characters'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
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
    </div>
  );
};

export default CharacterDashboard;
