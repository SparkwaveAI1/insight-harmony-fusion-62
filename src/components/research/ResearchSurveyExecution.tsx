import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, Download, Users, MessageSquare, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';
import { getAllPersonas } from '@/services/persona';
import { Persona } from '@/services/persona/types';

interface SurveyData {
  name: string;
  description?: string;
  questions: string[];
}

interface PersonaResponse {
  personaId: string;
  questionIndex: number;
  question: string;
  response: string;
  timestamp: Date;
}

interface ResearchSurveyExecutionProps {
  surveyData: SurveyData;
  selectedPersonas: string[];
  sessionId?: string;
  projectId?: string;
  sendMessage: (message: string) => Promise<void>;
  sendToPersona: (personaId: string) => Promise<void>;
  onComplete: () => void;
  onBack: () => void;
}

export const ResearchSurveyExecution: React.FC<ResearchSurveyExecutionProps> = ({ 
  surveyData, 
  selectedPersonas,
  sessionId,
  projectId,
  sendMessage,
  sendToPersona,
  onComplete,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState<'running' | 'results'>('running');
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<PersonaResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [researchSurveyId, setResearchSurveyId] = useState<string | null>(null);
  const [researchSessionId, setResearchSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<Persona[]>([]);
  const { toast } = useToast();

  const totalQuestions = surveyData.questions.length;
  const totalPersonas = selectedPersonas.length;
  const totalInteractions = totalQuestions * totalPersonas;
  const completedInteractions = responses.length;
  const progressPercentage = (completedInteractions / totalInteractions) * 100;

  const currentPersonaId = selectedPersonas[currentPersonaIndex];
  const currentQuestion = surveyData.questions[currentQuestionIndex];
  const isComplete = completedInteractions === totalInteractions;

  // Load personas and initialize research survey session in database
  useEffect(() => {
    const initializeResearchSurvey = async () => {
      if (!sessionId || !projectId) return;
      
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('No authenticated user');

        // Load all personas and filter for selected ones
        console.log('Loading personas for survey...');
        const allPersonas = await getAllPersonas();
        const filteredPersonas = allPersonas.filter(p => selectedPersonas.includes(p.persona_id));
        setLoadedPersonas(filteredPersonas);
        console.log(`Loaded ${filteredPersonas.length} personas for survey`);

        // First, create the research survey record
        const { data: surveyRecord, error: surveyError } = await supabase
          .from('research_surveys')
          .insert({
            project_id: projectId,
            name: surveyData.name,
            description: surveyData.description || '',
            questions: surveyData.questions,
            user_id: user.data.user.id,
            status: 'active'
          })
          .select('id')
          .single();
          
        if (surveyError) throw surveyError;
        setResearchSurveyId(surveyRecord.id);

        // Then create the research survey session
        const { data: sessionRecord, error: sessionError } = await supabase
          .from('research_survey_sessions')
          .insert({
            research_survey_id: surveyRecord.id,
            conversation_id: sessionId, // Link to the conversation/research session
            selected_personas: selectedPersonas,
            user_id: user.data.user.id,
            status: 'pending',
            started_at: new Date().toISOString()
          })
          .select('id')
          .single();
          
        if (sessionError) throw sessionError;
        setResearchSessionId(sessionRecord.id);
        
        toast({
          title: "Research Survey Initialized",
          description: "Ready to start automated processing.",
        });
      } catch (error) {
        console.error('Error initializing research survey:', error);
        toast({
          title: "Setup Error",
          description: "Failed to initialize research survey. Please try again.",
          variant: "destructive"
        });
      }
    };

    initializeResearchSurvey();
  }, [sessionId, selectedPersonas, surveyData, projectId]);

  // Generate persona response using the proper persona API
  const generatePersonaResponse = async (personaId: string, question: string): Promise<string> => {
    console.log('=== GENERATING PERSONA RESPONSE ===');
    console.log('Persona ID:', personaId);
    console.log('Question:', question);
    
    // Find the persona in our loaded personas
    const persona = loadedPersonas.find(p => p.persona_id === personaId);
    if (!persona) {
      throw new Error(`Persona ${personaId} not found in loaded personas`);
    }
    
    try {
      // Create survey context
      const surveyContext = `Research Survey: ${surveyData.name}
${surveyData.description ? `Description: ${surveyData.description}` : ''}
Question ${currentQuestionIndex + 1} of ${surveyData.questions.length}
Context: This is a research survey where you should provide thoughtful, authentic responses based on your demographic profile and personality traits.`;

      // Generate response using the proper persona API with validation
      const response = await sendMessageToPersona(
        personaId,
        question,
        [], // No previous messages for survey questions
        persona,
        'research', // Use research mode for survey context
        surveyContext,
        undefined, // No image data
        3 // Max 3 retries for quality responses
      );
      
      console.log('✅ Generated response:', response.substring(0, 100) + '...');
      return response;
    } catch (error) {
      console.error('❌ Error generating persona response:', error);
      throw error;
    }
  };

  // Automated processing loop
  useEffect(() => {
    if (!isProcessing || isPaused || isComplete || !researchSessionId) return;

    const processNextQuestion = async () => {
      try {
        const response = await generatePersonaResponse(currentPersonaId, currentQuestion);
        
        const newResponse: PersonaResponse = {
          personaId: currentPersonaId,
          questionIndex: currentQuestionIndex,
          question: currentQuestion,
          response: response,
          timestamp: new Date()
        };

        // Save to database using research survey tables
        const { error: dbError } = await supabase
          .from('research_survey_responses')
          .insert({
            session_id: researchSessionId,
            persona_id: currentPersonaId,
            question_index: currentQuestionIndex,
            question_text: currentQuestion,
            response_text: response
          });

        if (dbError) {
          console.error('Database error:', dbError);
          toast({
            title: "Warning", 
            description: "Response generated but failed to save to database.",
            variant: "destructive"
          });
        }

        setResponses(prev => [...prev, newResponse]);
        setErrorCount(0); // Reset error count on success

        // Move to next question or persona
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else if (currentPersonaIndex < totalPersonas - 1) {
          setCurrentPersonaIndex(prev => prev + 1);
          setCurrentQuestionIndex(0);
        } else {
          // All done
          setIsProcessing(false);
          setCurrentStep('results');
          
          // Update research survey session status
          await supabase
            .from('research_survey_sessions')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', researchSessionId);
            
          toast({
            title: "Survey Complete",
            description: `Collected ${totalInteractions} responses from ${totalPersonas} personas.`,
          });
        }
      } catch (error) {
        console.error('Error in automated processing:', error);
        setErrorCount(prev => prev + 1);
        
        if (errorCount >= 3) {
          setIsProcessing(false);
          setIsPaused(true);
          toast({
            title: "Processing Paused",
            description: "Multiple errors occurred. Review and resume manually.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Retry",
            description: `Error occurred, retrying... (${errorCount + 1}/3)`,
            variant: "destructive"
          });
        }
      }
    };

    // Add delay between questions to avoid overwhelming the system
    const timer = setTimeout(processNextQuestion, 2000);
    return () => clearTimeout(timer);
  }, [isProcessing, isPaused, isComplete, researchSessionId, currentPersonaIndex, currentQuestionIndex, errorCount]);

  const startAutomatedProcessing = () => {
    setIsProcessing(true);
    setIsPaused(false);
    setErrorCount(0);
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  const resumeProcessing = () => {
    setIsPaused(false);
    setIsProcessing(true);
  };

  const exportResults = () => {
    const csvContent = [
      ['Persona ID', 'Question Index', 'Question', 'Response', 'Timestamp'],
      ...responses.map(r => [
        r.personaId,
        r.questionIndex.toString(),
        `"${r.question.replace(/"/g, '""')}"`,
        `"${r.response.replace(/"/g, '""')}"`,
        r.timestamp.toISOString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${surveyData.name.replace(/[^a-zA-Z0-9]/g, '_')}_results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Survey results have been downloaded as CSV.",
    });
  };

  if (currentStep === 'results') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Survey Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-sm text-blue-700">Questions Asked</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{totalPersonas}</div>
                <div className="text-sm text-green-700">Personas Surveyed</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{responses.length}</div>
                <div className="text-sm text-purple-700">Total Responses</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={exportResults} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Results (CSV)
              </Button>
              <Button variant="outline" onClick={onComplete}>
                Create New Survey
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back to Persona Selection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Response Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Response Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {responses.slice(-5).map((response, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users className="w-4 h-4" />
                    Persona {response.personaId}
                    <MessageSquare className="w-4 h-4 ml-2" />
                    Question {response.questionIndex + 1}
                  </div>
                  <div className="text-sm font-medium mb-1">{response.question}</div>
                  <div className="text-sm text-muted-foreground">{response.response.substring(0, 200)}...</div>
                </div>
              ))}
            </div>
            {responses.length > 5 && (
              <div className="text-sm text-muted-foreground text-center mt-2">
                Showing last 5 responses. Download CSV for complete results.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{completedInteractions}/{totalInteractions} responses</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Current Persona:</div>
              <div className="text-muted-foreground">
                {currentPersonaId} ({currentPersonaIndex + 1}/{totalPersonas})
              </div>
            </div>
            <div>
              <div className="font-medium">Current Question:</div>
              <div className="text-muted-foreground">
                Question {currentQuestionIndex + 1}/{totalQuestions}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium">{currentQuestion}</div>
          </div>

          <div className="text-sm text-muted-foreground">
            Asking persona: <span className="font-medium">{currentPersonaId}</span>
          </div>

          <div className="flex gap-3">
            {!isProcessing && !isComplete && (
              <Button 
                onClick={startAutomatedProcessing}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Automated Survey
              </Button>
            )}
            
            {isProcessing && !isPaused && (
              <Button 
                onClick={pauseProcessing}
                variant="outline"
                size="lg"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause Processing
              </Button>
            )}

            {isPaused && !isComplete && (
              <Button 
                onClick={resumeProcessing}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Processing
              </Button>
            )}
            
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                🤖 Automated processing in progress... Persona {currentPersonaId} is analyzing the question.
              </div>
              <div className="text-xs text-muted-foreground">
                This will continue automatically until all {totalInteractions} responses are collected.
              </div>
            </div>
          )}

          {isPaused && (
            <div className="text-sm text-amber-600">
              ⏸️ Processing paused. Click "Resume Processing" to continue.
            </div>
          )}

          {errorCount > 0 && errorCount < 3 && (
            <div className="text-sm text-orange-600">
              ⚠️ {errorCount} error(s) occurred. Retrying automatically...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Responses */}
      {responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {responses.slice(-3).reverse().map((response, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    {response.personaId} - Q{response.questionIndex + 1}
                  </div>
                  <div className="text-sm">{response.response.substring(0, 150)}...</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};