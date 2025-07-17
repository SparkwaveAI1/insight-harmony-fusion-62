
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';

interface SurveyData {
  name: string;
  description?: string;
  questions: string[];
}

interface PersonaStatus {
  personaId: string;
  personaName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  responses: string[];
  error?: string;
}

interface AutomatedSurveyExecutionProps {
  surveyData: SurveyData;
  selectedPersonas: string[];
  loadedPersonas: Persona[];
  sessionId: string | null;
  projectDocuments: any[];
  sendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  sendToPersona: (personaId: string) => Promise<void>;
  onComplete: () => void;
  onBack: () => void;
}

export const AutomatedSurveyExecution: React.FC<AutomatedSurveyExecutionProps> = ({
  surveyData,
  selectedPersonas,
  loadedPersonas,
  sessionId,
  projectDocuments,
  sendMessage,
  sendToPersona,
  onComplete,
  onBack
}) => {
  const [personaStatuses, setPersonaStatuses] = useState<PersonaStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [surveyStarted, setSurveyStarted] = useState(false);

  // Initialize persona statuses
  useEffect(() => {
    const initialStatuses: PersonaStatus[] = selectedPersonas.map(personaId => {
      const persona = loadedPersonas.find(p => p.persona_id === personaId);
      return {
        personaId,
        personaName: persona?.name || `Persona ${personaId.slice(-4)}`,
        status: 'pending',
        responses: []
      };
    });
    setPersonaStatuses(initialStatuses);
  }, [selectedPersonas, loadedPersonas]);

  // Format complete survey message
  const formatSurveyMessage = useCallback(() => {
    let message = `AUTOMATED SURVEY: ${surveyData.name}\n\n`;
    
    if (surveyData.description) {
      message += `Survey Description: ${surveyData.description}\n\n`;
    }

    if (projectDocuments.length > 0) {
      message += `RESEARCH CONTEXT:\nYou have access to the following knowledge base documents:\n`;
      projectDocuments.forEach(doc => {
        message += `- "${doc.title}"\n`;
      });
      message += '\n';
    }

    message += `INSTRUCTIONS:\nPlease respond to ALL questions below in order. For each question, provide a thoughtful response based on your persona characteristics and any relevant information from the knowledge base documents.\n\n`;
    
    message += `SURVEY QUESTIONS:\n`;
    surveyData.questions.forEach((question, index) => {
      message += `${index + 1}. ${question}\n\n`;
    });

    message += `RESPONSE FORMAT:\nPlease structure your response as follows:
Answer 1: [Your response to question 1]

Answer 2: [Your response to question 2]

[Continue for all questions...]

Please ensure each answer is complete and reflects your persona's perspective.`;

    return message;
  }, [surveyData, projectDocuments]);

  // Auto-start survey when component mounts
  useEffect(() => {
    if (!surveyStarted && sessionId && selectedPersonas.length > 0) {
      console.log('Auto-starting automated survey execution');
      startAutomatedSurvey();
      setSurveyStarted(true);
    }
  }, [sessionId, selectedPersonas.length, surveyStarted]);

  // Start automated survey execution
  const startAutomatedSurvey = async () => {
    if (!sessionId || selectedPersonas.length === 0) {
      toast.error('Survey session not ready');
      return;
    }

    console.log('Starting automated survey execution...');
    setIsRunning(true);

    try {
      // Step 1: Send comprehensive survey message
      const surveyMessage = formatSurveyMessage();
      console.log('Sending comprehensive survey message to session');
      await sendMessage(surveyMessage);

      toast.success('Survey sent to all personas - collecting responses...');

      // Step 2: Automatically trigger responses from all personas
      await collectAllPersonaResponses();

    } catch (error) {
      console.error('Error starting automated survey:', error);
      toast.error('Failed to start automated survey');
      setIsRunning(false);
    }
  };

  // Collect responses from all personas automatically
  const collectAllPersonaResponses = async () => {
    console.log('Collecting responses from all personas automatically...');

    // Process personas in parallel with status tracking
    const responsePromises = selectedPersonas.map(async (personaId) => {
      try {
        // Update status to processing
        setPersonaStatuses(prev => prev.map(p => 
          p.personaId === personaId ? { ...p, status: 'processing' } : p
        ));

        console.log(`Requesting response from persona: ${personaId}`);
        await sendToPersona(personaId);

        // Update status to completed
        setPersonaStatuses(prev => prev.map(p => 
          p.personaId === personaId ? { ...p, status: 'completed' } : p
        ));

        console.log(`Response received from persona: ${personaId}`);

      } catch (error) {
        console.error(`Error getting response from persona ${personaId}:`, error);
        
        // Update status to error
        setPersonaStatuses(prev => prev.map(p => 
          p.personaId === personaId ? { 
            ...p, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
          } : p
        ));
      }
    });

    // Wait for all responses
    await Promise.allSettled(responsePromises);

    // Check completion
    setPersonaStatuses(prev => {
      const completedCount = prev.filter(p => p.status === 'completed').length;
      const errorCount = prev.filter(p => p.status === 'error').length;
      
      console.log(`Survey complete: ${completedCount} completed, ${errorCount} errors`);
      
      if (completedCount + errorCount === prev.length) {
        setIsRunning(false);
        setIsComplete(true);
        toast.success(`Survey completed! ${completedCount} personas responded successfully.`);
      }
      
      return prev;
    });
  };

  // Calculate progress
  const completedCount = personaStatuses.filter(p => p.status === 'completed').length;
  const errorCount = personaStatuses.filter(p => p.status === 'error').length;
  const processingCount = personaStatuses.filter(p => p.status === 'processing').length;
  const totalPersonas = personaStatuses.length;
  const progress = totalPersonas > 0 ? ((completedCount + errorCount) / totalPersonas) * 100 : 0;

  // Export results
  const exportResults = () => {
    const results = {
      surveyName: surveyData.name,
      surveyDescription: surveyData.description,
      completedAt: new Date().toISOString(),
      totalPersonas,
      completedResponses: completedCount,
      errors: errorCount,
      personaStatuses: personaStatuses.map(p => ({
        personaName: p.personaName,
        status: p.status,
        error: p.error
      }))
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automated-survey-${surveyData.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: PersonaStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Automated Survey: {surveyData.name}
            </CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{totalPersonas} personas • {surveyData.questions.length} questions</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                {completedCount} completed
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" />
                {processingCount} processing
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  {errorCount} errors
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isRunning && !isComplete && totalPersonas === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium mb-2">Preparing Automated Survey</h3>
              <p className="text-sm text-muted-foreground">
                Setting up personas and research context...
              </p>
            </div>
          )}

          {isRunning && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">Survey Running Automatically</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All personas are processing the complete survey. Responses are being collected automatically.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {personaStatuses.map(persona => (
                  <div key={persona.personaId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(persona.status)}
                      <span className="font-medium text-sm">{persona.personaName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {persona.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isComplete && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-medium mb-2 text-green-800">Automated Survey Complete!</h3>
                <p className="text-sm text-green-700 mb-4">
                  {completedCount} of {totalPersonas} personas completed the survey successfully.
                  {errorCount > 0 && ` ${errorCount} personas encountered errors.`}
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={exportResults} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>
                  <Button onClick={onComplete}>
                    View Detailed Results
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {personaStatuses.map(persona => (
                  <div 
                    key={persona.personaId} 
                    className={`p-3 border rounded-lg ${
                      persona.status === 'completed' ? 'bg-green-50 border-green-200' :
                      persona.status === 'error' ? 'bg-red-50 border-red-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{persona.personaName}</span>
                      {getStatusIcon(persona.status)}
                    </div>
                    {persona.error && (
                      <p className="text-xs text-red-600">{persona.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
