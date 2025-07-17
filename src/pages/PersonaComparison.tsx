
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PersonaComparison = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Persona Comparison</CardTitle>
            <CardDescription>
              Compare multiple personas side by side
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Persona comparison interface will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonaComparison;
