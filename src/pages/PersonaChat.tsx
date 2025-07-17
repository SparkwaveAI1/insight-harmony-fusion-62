
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PersonaChat = () => {
  const { personaId } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Chat with Persona</CardTitle>
            <CardDescription>
              Chatting with persona: {personaId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Persona chat interface will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonaChat;
