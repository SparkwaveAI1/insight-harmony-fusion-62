
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAllPersonas } from '@/services/persona';
import { Persona } from '@/services/persona/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/layout/Header';

const PersonaDashboard = () => {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const allPersonas = await getAllPersonas();
        setPersonas(allPersonas);
      } catch (error) {
        console.error('Error loading personas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Persona Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your research personas and collections
            </p>
          </div>
          <Button asChild>
            <Link to="/personas/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Persona
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <Card key={persona.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{persona.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {persona.description || 'No description'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {persona.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(persona.created_at || '').toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/personas/${persona.persona_id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/personas/${persona.persona_id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {personas.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No personas yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first persona.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/personas/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Persona
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaDashboard;
