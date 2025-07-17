
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SurveyInterface = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Survey Interface</CardTitle>
            <CardDescription>
              Create and manage research surveys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Survey interface will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveyInterface;
