
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';
import { SurveyReportGenerator } from './reports/SurveyReportGenerator';
import { PersonaSurveyStatus } from './utils/responseUtils';

interface SurveyResultsProps {
  surveyName: string;
  surveyDescription?: string;
  questions: string[];
  sessionId: string;
  surveySessionId?: string | null;
  loadedPersonas: Persona[];
  onBack: () => void;
}

interface StoredResponse {
  id: string;
  persona_id: string;
  question_index: number;
  question_text: string;
  response_text: string;
  created_at: string;
}

export const SurveyResults: React.FC<SurveyResultsProps> = ({
  surveyName,
  surveyDescription,
  questions,
  sessionId,
  surveySessionId,
  loadedPersonas,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('by-question');
  const [responses, setResponses] = useState<StoredResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [personaStatuses, setPersonaStatuses] = useState<PersonaSurveyStatus[]>([]);

  // Load responses from database
  useEffect(() => {
    const loadResponses = async () => {
      try {
        // Use surveySessionId first, fallback to sessionId
        const sessionIdToUse = surveySessionId || sessionId;
        console.log('Loading survey results with session ID:', sessionIdToUse);
        
        const { data, error } = await supabase
          .from('research_survey_responses')
          .select('*')
          .eq('session_id', sessionIdToUse)
          .order('persona_id', { ascending: true })
          .order('question_index', { ascending: true });

        if (error) {
          console.error('Error loading survey responses:', error);
          toast.error('Failed to load survey responses');
          return;
        }

        console.log(`Loaded ${data?.length || 0} survey responses from database`);
        setResponses(data || []);
        
        // Convert responses to PersonaSurveyStatus format
        const statusMap = new Map<string, PersonaSurveyStatus>();
        
        (data || []).forEach(response => {
          const persona = loadedPersonas.find(p => p.persona_id === response.persona_id);
          if (!persona) return;
          
          if (!statusMap.has(response.persona_id)) {
            statusMap.set(response.persona_id, {
              personaId: response.persona_id,
              personaName: persona.name,
              status: 'completed',
              responses: []
            });
          }
          
          statusMap.get(response.persona_id)!.responses.push({
            personaId: response.persona_id,
            personaName: persona.name,
            questionIndex: response.question_index,
            questionText: response.question_text,
            responseText: response.response_text,
            timestamp: new Date(response.created_at)
          });
        });
        
        setPersonaStatuses(Array.from(statusMap.values()));
      } catch (error) {
        console.error('Error loading survey responses:', error);
        toast.error('Failed to load survey responses');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId || surveySessionId) {
      loadResponses();
    }
  }, [sessionId, surveySessionId, loadedPersonas]);

  // Group responses by question
  const responsesByQuestion = questions.map((questionText, qIndex) => {
    const questionResponses = responses
      .filter(r => r.question_index === qIndex)
      .map(response => {
        const persona = loadedPersonas.find(p => p.persona_id === response.persona_id);
        return {
          personaId: response.persona_id,
          personaName: persona?.name || `Persona ${response.persona_id.slice(-4)}`,
          responseText: response.response_text
        };
      });
    
    return {
      questionIndex: qIndex,
      questionText,
      responses: questionResponses
    };
  });

  // Group responses by persona
  const responsesByPersona = loadedPersonas.map(persona => {
    const personaResponses = responses
      .filter(r => r.persona_id === persona.persona_id)
      .sort((a, b) => a.question_index - b.question_index)
      .map(response => ({
        questionIndex: response.question_index,
        questionText: response.question_text,
        responseText: response.response_text
      }));
    
    return {
      personaId: persona.persona_id,
      personaName: persona.name,
      responses: personaResponses
    };
  }).filter(persona => persona.responses.length > 0);

  // Export results
  const exportResults = () => {
    const results = {
      surveyName,
      surveyDescription,
      timestamp: new Date().toISOString(),
      questions,
      totalResponses: responses.length,
      sessionId: surveySessionId || sessionId,
      responsesByQuestion: responsesByQuestion.map(q => ({
        questionIndex: q.questionIndex,
        questionText: q.questionText,
        responses: q.responses
      })),
      responsesByPersona: responsesByPersona.map(p => ({
        personaId: p.personaId,
        personaName: p.personaName,
        responses: p.responses
      }))
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-results-${surveyName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Survey results exported successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading survey results...</p>
        </div>
      </div>
    );
  }

  if (showReport) {
    return (
      <SurveyReportGenerator
        surveyName={surveyName}
        surveyDescription={surveyDescription}
        questions={questions}
        personaStatuses={personaStatuses}
        onBack={() => setShowReport(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{surveyName} - Results</h2>
          {surveyDescription && (
            <p className="text-muted-foreground">{surveyDescription}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {responses.length} total responses from {responsesByPersona.length} personas
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button variant="outline" onClick={exportResults}>
            <Download className="w-4 h-4 mr-2" />
            Export Raw Data
          </Button>

          <Button onClick={() => setShowReport(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-question">By Question</TabsTrigger>
          <TabsTrigger value="by-persona">By Persona</TabsTrigger>
        </TabsList>
        
        <TabsContent value="by-question" className="space-y-6 mt-4">
          {responsesByQuestion.map((questionData) => (
            <Card key={`question-${questionData.questionIndex}`}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {questionData.questionIndex + 1}
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap">
                  {questionData.questionText}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questionData.responses.length > 0 ? (
                  questionData.responses.map((personaResponse) => (
                    <div key={`q${questionData.questionIndex}-p${personaResponse.personaId}`} className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">{personaResponse.personaName}</div>
                      <p className="text-sm whitespace-pre-wrap">{personaResponse.responseText}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No responses recorded for this question
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="by-persona" className="space-y-6 mt-4">
          {responsesByPersona.length > 0 ? (
            responsesByPersona.map((personaData) => (
              <Card key={`persona-${personaData.personaId}`}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {personaData.personaName}
                  </CardTitle>
                  <CardDescription>
                    {personaData.responses.length} of {questions.length} questions answered
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {personaData.responses.map((questionResponse) => (
                    <div key={`p${personaData.personaId}-q${questionResponse.questionIndex}`} className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">
                        Question {questionResponse.questionIndex + 1}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {questionResponse.questionText}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{questionResponse.responseText}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No persona responses found
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SurveyResults;
