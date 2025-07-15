import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PersonaLoader } from './PersonaLoader';
import { ResearchSurveyBuilder } from './ResearchSurveyBuilder';
import { ResearchCSVImport } from './ResearchCSVImport';
import ResearchInterface from './ResearchInterface';
import { useResearchSession } from './hooks/useResearchSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, Plus, Users, FileText, ArrowLeft, Play } from 'lucide-react';
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const projectId = searchParams.get('project');
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

  const sessionData = {
    sessionId,
    loadedPersonas,
    projectDocuments,
    messages,
    isLoading
  };

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
    setStep('execution');
    
    // Start research session with selected personas
    const success = await createSession(personas);
    if (success && surveyData?.questions.length) {
      // Send the first question automatically
      await sendMessage(surveyData.questions[0]);
      setCurrentQuestionIndex(1);
    }
    
    toast({
      title: "Survey Started",
      description: `Survey started with ${personas.length} personas.`,
    });
    
    return success;
  };

  const handleSurveyMessage = async (message: string, imageFile?: File | null) => {
    await sendMessage(message, imageFile);
    
    // Auto-advance to next question if in survey mode and more questions exist
    if (surveyData && currentQuestionIndex < surveyData.questions.length) {
      setTimeout(async () => {
        await sendMessage(surveyData.questions[currentQuestionIndex]);
        setCurrentQuestionIndex(prev => prev + 1);
      }, 3000); // Wait 3 seconds before next question
    }
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
    setCurrentQuestionIndex(0);
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
    <div className="container h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <Button
          variant="outline"
          onClick={() => setStep('personas')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Personas
        </Button>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold">"{surveyData?.name}"</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Question {Math.min(currentQuestionIndex, surveyData?.questions.length || 0)} / {surveyData?.questions.length}</span>
            <span>{selectedPersonas.length} personas</span>
          </div>
        </div>
        <div className="w-24"> {/* Spacer for balance */}</div>
      </div>
      <div className="flex-1 min-h-0">
        <ResearchInterface 
          sessionData={sessionData}
          onCreateSession={handlePersonasSelected}
          onSendMessage={handleSurveyMessage}
          onSendToPersona={sendToPersona}
        />
      </div>
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