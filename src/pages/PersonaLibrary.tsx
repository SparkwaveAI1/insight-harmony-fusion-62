
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PersonaLibrary = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Persona Library</CardTitle>
            <CardDescription>
              Browse and discover personas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Persona library interface will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonaLibrary;
