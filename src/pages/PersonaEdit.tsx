
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PersonaEdit = () => {
  const { personaId } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Persona</CardTitle>
            <CardDescription>
              Editing persona: {personaId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Persona editing interface will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonaEdit;
