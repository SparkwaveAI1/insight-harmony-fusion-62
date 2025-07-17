
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectCreate = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>
              Start a new research project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Project creation interface will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectCreate;
