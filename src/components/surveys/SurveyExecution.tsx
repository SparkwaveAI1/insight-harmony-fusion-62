import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Survey {
  id: string;
  name: string;
  description: string;
  questions: string[];
}

interface SurveyExecutionProps {
  survey: Survey;
  personaId: string;
  onComplete: () => void;
}

interface SurveyResponse {
  question: string;
  response: string;
}

export const SurveyExecution: React.FC<SurveyExecutionProps> = ({ 
  survey, 
  personaId, 
  onComplete 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('survey_sessions')
        .insert([{
          survey_id: survey.id,
          persona_id: personaId,
          user_id: user.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('Failed to start survey session');
    }
  };

  const generatePersonaResponse = async (question: string): Promise<string> => {
    setIsGeneratingResponse(true);
    try {
      // Use the enhanced persona API service for consistent responses
      const { sendMessageToPersona } = await import('@/components/persona-chat/api/personaApiService');
      const { usePersona } = await import('@/hooks/usePersona');
      
      // Get persona data
      const { data: personaData, error } = await supabase
        .from('personas')
        .select('*')
        .eq('id', personaId)
        .single();
      
      if (error || !personaData) {
        throw new Error('Failed to load persona data');
      }

      // Convert database persona to expected format
      const formattedPersona = {
        ...personaData,
        persona_context: personaData.description || '',
        persona_type: 'research'
      } as any;

      const response = await sendMessageToPersona(
        personaId,
        question,
        [], // No previous messages for survey questions
        formattedPersona,
        'conversation', // Use conversation mode for surveys
        'survey_interview' // Context
      );
      
      return response || 'No response generated';
    } catch (error) {
      console.error('Error generating response:', error);
      return 'Sorry, I could not generate a response to this question.';
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleNextQuestion = async () => {
    const currentQuestion = survey.questions[currentQuestionIndex];
    
    // Generate response for current question
    const response = await generatePersonaResponse(currentQuestion);
    
    // Save response to database
    if (sessionId) {
      try {
        await supabase
          .from('survey_responses')
          .insert([{
            session_id: sessionId,
            question_index: currentQuestionIndex,
            question_text: currentQuestion,
            response_text: response,
            persona_id: personaId
          }]);
      } catch (error) {
        console.error('Error saving response:', error);
        toast.error('Failed to save response');
      }
    }

    // Update local state
    const newResponse = { question: currentQuestion, response };
    setResponses([...responses, newResponse]);

    // Move to next question or complete
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await completeSession();
    }
  };

  const completeSession = async () => {
    if (sessionId) {
      try {
        await supabase
          .from('survey_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }
    
    setIsCompleted(true);
    toast.success('Survey completed successfully!');
  };

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={24} />
            Survey Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The survey "{survey.name}" has been completed successfully. 
            {responses.length} responses have been recorded.
          </p>
          <div className="space-y-3">
            {responses.map((resp, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="font-medium text-sm mb-2">Question {index + 1}:</p>
                <p className="text-sm text-muted-foreground mb-3">{resp.question}</p>
                <p className="text-sm">{resp.response}</p>
              </div>
            ))}
          </div>
          <Button onClick={onComplete} className="w-full">
            Return to Survey List
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / survey.questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Running Survey: {survey.name}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onComplete}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to List
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {survey.questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Current Question:</h3>
            <p>{currentQuestion}</p>
          </div>

          {responses.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Previous Responses:</h3>
              {responses.slice(-2).map((resp, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-1">{resp.question}</p>
                  <p className="text-sm">{resp.response}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleNextQuestion}
            disabled={isGeneratingResponse}
            className="flex items-center gap-2"
          >
            {isGeneratingResponse ? (
              'Generating response...'
            ) : currentQuestionIndex === survey.questions.length - 1 ? (
              <>
                <CheckCircle size={16} />
                Complete Survey
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                Next Question
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};