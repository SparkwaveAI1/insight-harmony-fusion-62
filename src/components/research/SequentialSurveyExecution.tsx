
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, CheckCircle, Clock, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { Message } from '@/components/persona-chat/types';

interface SurveyData {
  name: string;
  description?: string;
  questions: string[];
}

interface PersonaProgress {
  personaId: string;
  personaName: string;
  currentQuestionIndex: number;
  responses: Array<{
    questionIndex: number;
    questionText: string;
    responseText: string;
    timestamp: Date;
  }>;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  error?: string;
}

interface SequentialSurveyExecutionProps {
  surveyData: SurveyData;
  selectedPersonas: string[];
  loadedPersonas: Persona[];
  sessionId: string | null;
  surveySessionId?: string | null;
  projectDocuments: any[];
  sendMessage: (message: string, imageFile?: File | null) => Promise<Message>;
  sendToPersona: (personaId: string, userMessage: Message) => Promise<string>;
  onComplete: () => void;
  onBack: () => void;
}

export const SequentialSurveyExecution: React.FC<SequentialSurveyExecutionProps> = ({
  surveyData,
  selectedPersonas,
  loadedPersonas,
  sessionId,
  surveySessionId,
  projectDocuments,
  sendMessage,
  sendToPersona,
  onComplete,
  onBack
}) => {
  const [personaProgress, setPersonaProgress] = useState<PersonaProgress[]>([]);
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize persona progress tracking
  useEffect(() => {
    const initialProgress: PersonaProgress[] = selectedPersonas.map(personaId => {
      const persona = loadedPersonas.find(p => p.persona_id === personaId);
      return {
        personaId,
        personaName: persona?.name || `Persona ${personaId.slice(-4)}`,
        currentQuestionIndex: 0,
        responses: [],
        status: 'pending'
      };
    });
    setPersonaProgress(initialProgress);
  }, [selectedPersonas, loadedPersonas]);

  // Auto-start the survey
  useEffect(() => {
    if (sessionId && personaProgress.length > 0 && !isRunning && !isComplete) {
      console.log('Auto-starting sequential survey execution');
      startSequentialSurvey();
    }
  }, [sessionId, personaProgress.length]);

  const startSequentialSurvey = async () => {
    if (!sessionId || personaProgress.length === 0) {
      toast.error('Survey session not ready');
      return;
    }

    console.log('Starting sequential survey execution...');
    setIsRunning(true);
    
    try {
      // Process each persona sequentially
      for (let personaIndex = 0; personaIndex < personaProgress.length; personaIndex++) {
        setCurrentPersonaIndex(personaIndex);
        const currentPersona = personaProgress[personaIndex];
        
        console.log(`Processing persona ${personaIndex + 1}/${personaProgress.length}: ${currentPersona.personaName}`);
        
        // Update status to in-progress
        setPersonaProgress(prev => prev.map((p, i) => 
          i === personaIndex ? { ...p, status: 'in-progress' } : p
        ));

        try {
          // Process each question for this persona
          for (let questionIndex = 0; questionIndex < surveyData.questions.length; questionIndex++) {
            const question = surveyData.questions[questionIndex];
            
            console.log(`Asking question ${questionIndex + 1}/${surveyData.questions.length} to ${currentPersona.personaName}`);
            
            // Update current question index
            setPersonaProgress(prev => prev.map((p, i) => 
              i === personaIndex ? { ...p, currentQuestionIndex: questionIndex } : p
            ));

            // Send the individual question
            const questionMessage = `Survey Question ${questionIndex + 1}/${surveyData.questions.length}: ${question}`;
            
            // Add context about the survey
            let contextualMessage = questionMessage;
            if (questionIndex === 0) {
              contextualMessage = `SURVEY: ${surveyData.name}\n\n`;
              if (surveyData.description) {
                contextualMessage += `Description: ${surveyData.description}\n\n`;
              }
              if (projectDocuments.length > 0) {
                contextualMessage += `You have access to project documents that may inform your responses.\n\n`;
              }
              contextualMessage += `I will ask you ${surveyData.questions.length} questions one by one. Please provide thoughtful responses based on your persona characteristics.\n\n${questionMessage}`;
            }

            // Send message and get the message object back
            const userMessage = await sendMessage(contextualMessage);
            
            console.log('Message sent, now getting persona response...');

            // Get response from this persona using the message object
            const response = await sendToPersona(currentPersona.personaId, userMessage);
            
            console.log(`Got response from ${currentPersona.personaName} for question ${questionIndex + 1}`);

            // Store the response
            const responseData = {
              questionIndex,
              questionText: question,
              responseText: response,
              timestamp: new Date()
            };

            // Update persona progress with the new response
            setPersonaProgress(prev => prev.map((p, i) => 
              i === personaIndex ? { 
                ...p, 
                responses: [...p.responses, responseData]
              } : p
            ));

            // Store in database - use the conversation sessionId for consistency
            if (sessionId) {
              try {
                await supabase
                  .from('research_survey_responses')
                  .insert({
                    session_id: sessionId, // Use conversation session ID
                    persona_id: currentPersona.personaId,
                    question_index: questionIndex,
                    question_text: question,
                    response_text: response
                  });
                
                console.log(`Stored response in database for ${currentPersona.personaName}, question ${questionIndex + 1}`);
              } catch (dbError) {
                console.error('Error storing response in database:', dbError);
                // Continue anyway - we have the response in memory
              }
            }

            // Small delay between questions for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // Mark persona as completed
          setPersonaProgress(prev => prev.map((p, i) => 
            i === personaIndex ? { ...p, status: 'completed' } : p
          ));

          console.log(`Completed all questions for ${currentPersona.personaName}`);

        } catch (personaError) {
          console.error(`Error processing persona ${currentPersona.personaName}:`, personaError);
          
          // Mark persona as error but continue with others
          setPersonaProgress(prev => prev.map((p, i) => 
            i === personaIndex ? { 
              ...p, 
              status: 'error', 
              error: personaError instanceof Error ? personaError.message : 'Unknown error'
            } : p
          ));
        }

        // Small delay between personas
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Survey completed
      setIsRunning(false);
      setIsComplete(true);
      
      const completedCount = personaProgress.filter(p => p.status === 'completed').length;
      const errorCount = personaProgress.filter(p => p.status === 'error').length;
      
      toast.success(`Sequential survey completed! ${completedCount} personas completed successfully.`);
      console.log(`Sequential survey complete: ${completedCount} completed, ${errorCount} errors`);

    } catch (error) {
      console.error('Error in sequential survey execution:', error);
      toast.error('Failed to complete sequential survey execution');
      setIsRunning(false);
    }
  };

  // Calculate overall progress
  const totalQuestions = surveyData.questions.length * personaProgress.length;
  const completedQuestions = personaProgress.reduce((sum, p) => sum + p.responses.length, 0);
  const overallProgress = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

  const completedPersonas = personaProgress.filter(p => p.status === 'completed').length;
  const errorPersonas = personaProgress.filter(p => p.status === 'error').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sequential Survey: {surveyData.name}
            </CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{personaProgress.length} personas • {surveyData.questions.length} questions each</span>
              <span>{Math.round(overallProgress)}% complete</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                {completedPersonas} completed
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" />
                {completedQuestions}/{totalQuestions} responses
              </span>
              {errorPersonas > 0 && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-red-600" />
                  {errorPersonas} errors
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isRunning && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">Processing Sequential Survey</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each persona will answer all questions one by one in sequence.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {personaProgress.map((persona, index) => (
                  <div 
                    key={persona.personaId} 
                    className={`p-3 border rounded-lg ${
                      persona.status === 'completed' ? 'bg-green-50 border-green-200' :
                      persona.status === 'error' ? 'bg-red-50 border-red-200' :
                      persona.status === 'in-progress' ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{persona.personaName}</span>
                      <div className="flex items-center gap-1">
                        {persona.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {persona.status === 'in-progress' && <Clock className="w-4 h-4 text-blue-600 animate-spin" />}
                        {persona.status === 'error' && <User className="w-4 h-4 text-red-600" />}
                        {persona.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      {persona.responses.length}/{surveyData.questions.length} questions answered
                    </div>
                    
                    {persona.status === 'in-progress' && (
                      <div className="text-xs text-blue-600">
                        Question {persona.currentQuestionIndex + 1}: {surveyData.questions[persona.currentQuestionIndex]?.substring(0, 50)}...
                      </div>
                    )}
                    
                    {persona.error && (
                      <div className="text-xs text-red-600 mt-1">{persona.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isComplete && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-medium mb-2 text-green-800">Sequential Survey Complete!</h3>
                <p className="text-sm text-green-700 mb-4">
                  {completedPersonas} of {personaProgress.length} personas completed all questions successfully.
                  {errorPersonas > 0 && ` ${errorPersonas} personas encountered errors.`}
                  <br />
                  <span className="font-medium">Total responses collected: {completedQuestions}</span>
                </p>
                <Button onClick={onComplete}>
                  View Survey Results
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {personaProgress.map(persona => (
                  <div 
                    key={persona.personaId} 
                    className={`p-3 border rounded-lg ${
                      persona.status === 'completed' ? 'bg-green-50 border-green-200' :
                      persona.status === 'error' ? 'bg-red-50 border-red-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{persona.personaName}</span>
                      {persona.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {persona.status === 'error' && <User className="w-4 h-4 text-red-600" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {persona.responses.length} responses collected
                    </p>
                    {persona.error && (
                      <p className="text-xs text-red-600 mt-1">{persona.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isRunning && !isComplete && personaProgress.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium mb-2">Preparing Sequential Survey</h3>
              <p className="text-sm text-muted-foreground">
                Setting up personas for sequential question processing...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
