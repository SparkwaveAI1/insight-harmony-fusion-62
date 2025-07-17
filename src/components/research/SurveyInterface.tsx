
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PersonaLoader } from './PersonaLoader';
import { ResearchSurveyBuilder } from './ResearchSurveyBuilder';
import { ResearchCSVImport } from './ResearchCSVImport';
import { ResearchSurveyExecution } from './ResearchSurveyExecution';
import ProjectSelector from './ProjectSelector';
import { useResearchSession } from './hooks/useResearchSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, Plus, Users, FileText, ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface SurveyData {
  name: string;
  description?: string;
  questions: string[];
}

interface SurveyInterfaceProps {
  onBack?: () => void;
}

const SurveyInterface: React.FC<SurveyInterfaceProps> = ({ onBack }) => {
  const [step, setStep] = useState<'project' | 'setup' | 'personas' | 'execution'>('project');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [showCSVDialog, setShowCSVDialog] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Initialize project from URL params
  React.useEffect(() => {
    const urlProjectId = searchParams.get('project');
    if (urlProjectId) {
      setProjectId(urlProjectId);
      setStep('setup');
    }
  }, [searchParams]);
  
  const hasProject = projectId !== null;

  // Use the existing research session hook
  const {
    sessionId,
    loadedPersonas,
    projectDocuments,
    messages,
    isLoading,
    createSession,
    sendMessage,
    sendToPersona
  } = useResearchSession(projectId || undefined);

  const handleSurveyCreated = (survey: SurveyData) => {
    setSurveyData(survey);
    setStep('personas');
    toast({
      title: "Survey Created",
      description: `Survey "${survey.name}" created with ${survey.questions.length} questions.`,
    });
  };

  const handleCSVImport = (questions: string[], surveyName: string) => {
    const importedSurvey: SurveyData = {
      name: surveyName,
      description: `Survey imported from CSV with ${questions.length} questions`,
      questions
    };
    setSurveyData(importedSurvey);
    setStep('personas');
    setShowCSVDialog(false);
    toast({
      title: "CSV Imported",
      description: `Successfully imported ${questions.length} questions.`,
    });
  };

  const handlePersonasSelected = async (personas: string[]): Promise<boolean> => {
    setSelectedPersonas(personas);
    
    try {
      // Start research session with selected personas
      const success = await createSession(personas);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to start research session",
          variant: "destructive"
        });
        return false;
      }
      
      setStep('execution');
      
      toast({
        title: "Survey Session Started",
        description: `Survey ready to run with ${personas.length} personas.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error starting survey:', error);
      toast({
        title: "Error",
        description: "Failed to start survey session",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleProjectSelected = (selectedProjectId: string) => {
    setProjectId(selectedProjectId || null);
    setStep('setup');
  };

  const renderSetupStep = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Create Survey</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create a conversational survey to gather qualitative insights from multiple personas. 
          Build questions manually or import from CSV.
        </p>
        {hasProject && projectDocuments.length > 0 && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Knowledge Base Available:</strong> {projectDocuments.length} document{projectDocuments.length !== 1 ? 's' : ''} will be available to personas during the survey.
            </AlertDescription>
          </Alert>
        )}
        {!hasProject && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>No Project Connected:</strong> Survey results can be exported but not saved. 
              To save results and upload supporting documents, connect this to a project.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Question Builder
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileUp className="w-4 h-4" />
            CSV Import
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder">
          <ResearchSurveyBuilder onSurveyCreated={handleSurveyCreated} />
        </TabsContent>
        
        <TabsContent value="csv">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="w-5 h-5" />
                Import Questions from CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Upload a CSV file with your survey questions. Format requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>One question per row</li>
                  <li>First column should contain the question text</li>
                  <li>Headers are optional (first row will be skipped if detected)</li>
                  <li>Maximum 50 questions per survey</li>
                </ul>
              </div>
              <Button onClick={() => setShowCSVDialog(true)} className="w-full">
                <FileUp className="w-4 h-4 mr-2" />
                Choose CSV File
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {onBack && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Research
          </Button>
        </div>
      )}
    </div>
  );

  const renderPersonaStep = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Select Personas</h1>
        <p className="text-muted-foreground">
          Choose personas to participate in your survey: "{surveyData?.name}"
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {surveyData?.questions.length} questions
          </div>
          {hasProject && projectDocuments.length > 0 && (
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {projectDocuments.length} support documents
            </div>
          )}
        </div>
      </div>

      <PersonaLoader
        maxPersonas={10}
        onStartSession={handlePersonasSelected}
        isLoading={false}
      />

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setStep('setup')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Questions
        </Button>
      </div>
    </div>
  );

  const renderExecutionStep = () => {
    if (!surveyData) return null;
    
    return (
      <div className="max-w-6xl mx-auto p-6">
        <ResearchSurveyExecution
          surveyData={surveyData}
          selectedPersonas={selectedPersonas}
          sessionId={sessionId}
          projectId={projectId}
          sendMessage={sendMessage}
          sendToPersona={sendToPersona}
          onComplete={() => {
            // Reset to start a new survey
            setStep('project');
            setSurveyData(null);
            setSelectedPersonas([]);
          }}
          onBack={() => setStep('personas')}
        />
      </div>
    );
  };

  const renderProjectStep = () => (
    <ProjectSelector 
      onProjectSelected={handleProject

}
      showCreateOption={true}
    />
  );

  return (
    <>
      {step === 'project' && renderProjectStep()}
      {step === 'setup' && renderSetupStep()}
      {step === 'personas' && renderPersonaStep()}
      {step === 'execution' && renderExecutionStep()}
      
      <ResearchCSVImport
        open={showCSVDialog}
        onOpenChange={setShowCSVDialog}
        onImport={handleCSVImport}
      />
    </>
  );
};

export default SurveyInterface;
