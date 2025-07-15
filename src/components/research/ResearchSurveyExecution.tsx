import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Download, Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  sendMessage: (message: string) => Promise<void>;
  sendToPersona: (personaId: string) => Promise<void>;
  onComplete: () => void;
  onBack: () => void;
}

export const ResearchSurveyExecution: React.FC<ResearchSurveyExecutionProps> = ({ 
  surveyData, 
  selectedPersonas,
  sessionId,
  sendMessage,
  sendToPersona,
  onComplete,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState<'running' | 'results'>('running');
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<PersonaResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const totalQuestions = surveyData.questions.length;
  const totalPersonas = selectedPersonas.length;
  const totalInteractions = totalQuestions * totalPersonas;
  const completedInteractions = responses.length;
  const progressPercentage = (completedInteractions / totalInteractions) * 100;

  const currentPersonaId = selectedPersonas[currentPersonaIndex];
  const currentQuestion = surveyData.questions[currentQuestionIndex];
  const isComplete = completedInteractions === totalInteractions;

  // Generate persona response using real research session
  const generatePersonaResponse = async (personaId: string, question: string): Promise<string> => {
    if (!sessionId) {
      throw new Error('No research session available');
    }
    
    setIsGenerating(true);
    
    try {
      // Send question to the session
      await sendMessage(question);
      
      // Wait a moment for the message to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send to specific persona to get response
      await sendToPersona(personaId);
      
      // For now, return a placeholder until we can capture the actual response
      // In a full implementation, you'd listen to the conversation messages
      return `Response from ${personaId} to: "${question}"`;
    } finally {
      setIsGenerating(false);
    }
  };

  const processNextQuestion = async () => {
    if (isComplete) return;

    try {
      const response = await generatePersonaResponse(currentPersonaId, currentQuestion);
      
      const newResponse: PersonaResponse = {
        personaId: currentPersonaId,
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        response: response,
        timestamp: new Date()
      };

      setResponses(prev => [...prev, newResponse]);

      // Move to next question or persona
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (currentPersonaIndex < totalPersonas - 1) {
        setCurrentPersonaIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
      } else {
        // All done
        setCurrentStep('results');
        toast({
          title: "Survey Complete",
          description: `Collected ${totalInteractions} responses from ${totalPersonas} personas.`,
        });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    }
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
            <Button 
              onClick={processNextQuestion}
              disabled={isGenerating || isComplete}
              size="lg"
            >
              {isGenerating ? 'Generating Response...' : 'Generate Response'}
            </Button>
            
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {isGenerating && (
            <div className="text-sm text-muted-foreground">
              Persona is thinking and formulating a response...
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