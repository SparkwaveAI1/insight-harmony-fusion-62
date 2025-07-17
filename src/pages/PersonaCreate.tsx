
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PersonaCreate = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Persona</CardTitle>
            <CardDescription>
              Build a new research persona for your studies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Persona creation interface will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonaCreate;
