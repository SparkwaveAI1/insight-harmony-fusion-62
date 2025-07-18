import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { PersonaSurveyStatus, SurveyResponse, parsePersonaResponse, formatSurveyResultsForExport } from './utils/responseUtils';
import { processPersonasInParallel, ProcessingProgress } from './utils/parallelProcessing';

interface SurveyData {
  name: string;
  description?: string;
  questions: string[];
}

interface AutomatedSurveyExecutionProps {
  surveyData: SurveyData;
  selectedPersonas: string[];
  loadedPersonas: Persona[];
  sessionId: string | null;
  projectDocuments: any[];
  sendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  sendToPersona: (personaId: string) => Promise<string>;
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
  const [personaStatuses, setPersonaStatuses] = useState<PersonaSurveyStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [surveyStarted, setSurveyStarted] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress>({
    total: 0,
    completed: 0,
    errors: 0,
    inProgress: 0
  });

  // Initialize persona statuses
  useEffect(() => {
    const initialStatuses: PersonaSurveyStatus[] = selectedPersonas.map(personaId => {
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
      console.log('Auto-starting parallel survey execution');
      startAutomatedSurvey();
      setSurveyStarted(true);
    }
  }, [sessionId, selectedPersonas.length, surveyStarted]);

  // Store survey response in database
  const storeSurveyResponse = async (
    personaId: string,
    questionIndex: number,
    questionText: string,
    responseText: string
  ) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('research_survey_responses')
        .insert({
          session_id: sessionId,
          persona_id: personaId,
          question_index: questionIndex,
          question_text: questionText,
          response_text: responseText
        });

      if (error) {
        console.error('Error storing survey response:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to store survey response:', error);
      throw error;
    }
  };

  // Start automated survey execution with parallel processing
  const startAutomatedSurvey = async () => {
    if (!sessionId || selectedPersonas.length === 0) {
      toast.error('Survey session not ready');
      return;
    }

    console.log('Starting parallel automated survey execution...');
    setIsRunning(true);

    try {
      // Step 1: Send comprehensive survey message
      const surveyMessage = formatSurveyMessage();
      console.log('Sending comprehensive survey message to session');
      await sendMessage(surveyMessage);

      toast.success('Survey sent to all personas - collecting responses in parallel...');

      // Step 2: Process all personas in parallel
      await collectAllPersonaResponsesInParallel();

    } catch (error) {
      console.error('Error starting automated survey:', error);
      toast.error('Failed to start automated survey');
      setIsRunning(false);
    }
  };

  // Collect responses from all personas in parallel
  const collectAllPersonaResponsesInParallel = async () => {
    console.log('Collecting responses from all personas in parallel...');

    // Update progress callback
    const onProgress = (progress: ProcessingProgress) => {
      setProcessingProgress(progress);
      
      // Update persona statuses based on progress
      setPersonaStatuses(prev => prev.map(persona => {
        if (progress.completed > 0 || progress.errors > 0) {
          // Keep existing status for completed/error personas
          return persona;
        } else if (progress.inProgress > 0) {
          // Mark as processing if in progress
          return { ...persona, status: 'processing' };
        }
        return persona;
      }));
    };

    try {
      // Process personas in parallel
      const results = await processPersonasInParallel(
        selectedPersonas,
        sendToPersona,
        onProgress,
        3 // Max 3 concurrent requests
      );

      // Process results and update statuses
      for (const result of results) {
        if (result.success && result.response) {
          // Parse the response to extract individual answers
          const parsedAnswers = parsePersonaResponse(result.response, surveyData.questions);
          console.log(`Parsed answers from ${result.personaId}:`, parsedAnswers);

          // Create structured responses for each question
          const structuredResponses: SurveyResponse[] = [];
          for (let i = 0; i < surveyData.questions.length; i++) {
            const persona = loadedPersonas.find(p => p.persona_id === result.personaId);
            const response: SurveyResponse = {
              personaId: result.personaId,
              personaName: persona?.name || `Persona ${result.personaId.slice(-4)}`,
              questionIndex: i,
              questionText: surveyData.questions[i],
              responseText: parsedAnswers[i] || `[No response found for question ${i + 1}]`,
              timestamp: new Date()
            };
            
            structuredResponses.push(response);
            
            // Store each response in the database
            await storeSurveyResponse(
              result.personaId,
              i,
              surveyData.questions[i],
              parsedAnswers[i] || `[No response found for question ${i + 1}]`
            );
          }

          // Update status to completed with real responses
          setPersonaStatuses(prev => prev.map(p => 
            p.personaId === result.personaId ? { 
              ...p, 
              status: 'completed',
              responses: structuredResponses
            } : p
          ));

          console.log(`Response processed and stored for persona: ${result.personaId}`);
        } else {
          // Update status to error
          setPersonaStatuses(prev => prev.map(p => 
            p.personaId === result.personaId ? { 
              ...p, 
              status: 'error', 
              error: result.error || 'Unknown error'
            } : p
          ));
        }
      }

      // Survey completion
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      setIsRunning(false);
      setIsComplete(true);
      
      toast.success(`Parallel survey completed! ${successCount} personas responded successfully.`);
      console.log(`Parallel survey complete: ${successCount} completed, ${errorCount} errors`);

    } catch (error) {
      console.error('Error in parallel survey execution:', error);
      toast.error('Failed to complete parallel survey execution');
      setIsRunning(false);
    }
  };

  // Calculate progress
  const completedCount = personaStatuses.filter(p => p.status === 'completed').length;
  const errorCount = personaStatuses.filter(p => p.status === 'error').length;
  const processingCount = personaStatuses.filter(p => p.status === 'processing').length;
  const totalPersonas = personaStatuses.length;
  const progress = totalPersonas > 0 ? ((completedCount + errorCount) / totalPersonas) * 100 : 0;

  const exportResults = () => {
    const results = formatSurveyResultsForExport(
      surveyData.name,
      surveyData.questions,
      personaStatuses
    );

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

  const getStatusIcon = (status: PersonaSurveyStatus['status']) => {
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
              Parallel Survey: {surveyData.name}
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
              {isRunning && processingProgress.inProgress > 0 && (
                <span className="text-blue-600 font-medium">
                  {processingProgress.inProgress} running in parallel
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isRunning && !isComplete && totalPersonas === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium mb-2">Preparing Parallel Survey</h3>
              <p className="text-sm text-muted-foreground">
                Setting up personas for parallel processing...
              </p>
            </div>
          )}

          {isRunning && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">Survey Running in Parallel</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Processing up to 3 personas simultaneously for faster completion.
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
                <h3 className="font-medium mb-2 text-green-800">Parallel Survey Complete!</h3>
                <p className="text-sm text-green-700 mb-4">
                  {completedCount} of {totalPersonas} personas completed the survey successfully.
                  {errorCount > 0 && ` ${errorCount} personas encountered errors.`}
                  <br />
                  <span className="font-medium">Processed in parallel for faster completion.</span>
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
                    {persona.status === 'completed' && (
                      <p className="text-xs text-green-600">
                        {persona.responses.length} responses captured
                      </p>
                    )}
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
