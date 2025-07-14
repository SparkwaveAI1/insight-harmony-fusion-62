import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PersonaLoader } from './PersonaLoader';
import { ResearchSurveyBuilder } from './ResearchSurveyBuilder';
import { ResearchCSVImport } from './ResearchCSVImport';
import { ResearchSurveyExecution } from './ResearchSurveyExecution';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, Plus, Users, FileText } from 'lucide-react';
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
  const [step, setStep] = useState<'setup' | 'personas' | 'execution'>('setup');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [showCSVDialog, setShowCSVDialog] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const hasProject = searchParams.get('project') !== null;

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

  const handlePersonasSelected = (personas: string[]) => {
    setSelectedPersonas(personas);
    setStep('execution');
    toast({
      title: "Personas Selected",
      description: `${personas.length} personas selected for the survey.`,
    });
  };

  const handleSurveyComplete = () => {
    toast({
      title: "Survey Complete",
      description: "All survey responses have been collected.",
    });
    // Reset to start a new survey
    setStep('setup');
    setSurveyData(null);
    setSelectedPersonas([]);
  };

  const renderSetupStep = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Create Survey</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create a conversational survey to gather qualitative insights from multiple personas. 
          Build questions manually or import from CSV.
        </p>
        {!hasProject && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md max-w-2xl mx-auto">
            <p className="text-sm text-amber-800">
              <strong>No Project Connected:</strong> Survey results can be exported but not saved. 
              To save results, connect this to a project.
            </p>
          </div>
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
        </div>
      </div>

      <PersonaLoader
        maxPersonas={10}
        onStartSession={handlePersonasSelected}
        isLoading={false}
      />

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setStep('setup')}>
          Back to Questions
        </Button>
      </div>
    </div>
  );

  const renderExecutionStep = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Survey Execution</h1>
        <p className="text-muted-foreground">
          Running survey "{surveyData?.name}" with {selectedPersonas.length} personas
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {surveyData?.questions.length} questions
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {selectedPersonas.length} personas
          </div>
        </div>
      </div>

      {surveyData && (
        <ResearchSurveyExecution
          surveyData={surveyData}
          selectedPersonas={selectedPersonas}
          onComplete={handleSurveyComplete}
          onBack={() => setStep('personas')}
        />
      )}
    </div>
  );

  return (
    <>
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