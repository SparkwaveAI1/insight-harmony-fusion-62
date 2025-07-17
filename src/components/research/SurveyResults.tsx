
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonaSurveyStatus } from './utils/responseUtils';
import { Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Persona } from '@/services/persona/types';

interface SurveyResultsProps {
  surveyName: string;
  surveyDescription?: string;
  questions: string[];
  personaStatuses: PersonaSurveyStatus[];
  loadedPersonas: Persona[];
  onExport: () => void;
  onBack: () => void;
}

export const SurveyResults: React.FC<SurveyResultsProps> = ({
  surveyName,
  surveyDescription,
  questions,
  personaStatuses,
  loadedPersonas,
  onExport,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('by-question');

  // Group responses by question
  const responsesByQuestion = questions.map((questionText, qIndex) => {
    const personaResponses = personaStatuses
      .filter(p => p.status === 'completed')
      .map(persona => {
        const response = persona.responses.find(r => r.questionIndex === qIndex);
        return {
          personaId: persona.personaId,
          personaName: persona.personaName,
          responseText: response?.responseText || 'No response'
        };
      });
    
    return {
      questionIndex: qIndex,
      questionText,
      responses: personaResponses
    };
  });

  // Group responses by persona
  const responsesByPersona = personaStatuses
    .filter(p => p.status === 'completed')
    .map(persona => {
      const questionResponses = questions.map((questionText, qIndex) => {
        const response = persona.responses.find(r => r.questionIndex === qIndex);
        return {
          questionIndex: qIndex,
          questionText,
          responseText: response?.responseText || 'No response'
        };
      });
      
      return {
        personaId: persona.personaId,
        personaName: persona.personaName,
        responses: questionResponses
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{surveyName} - Results</h2>
          {surveyDescription && (
            <p className="text-muted-foreground">{surveyDescription}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Results
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
                {questionData.responses.map((personaResponse) => (
                  <div key={`q${questionData.questionIndex}-p${personaResponse.personaId}`} className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">{personaResponse.personaName}</div>
                    <p className="text-sm whitespace-pre-wrap">{personaResponse.responseText}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="by-persona" className="space-y-6 mt-4">
          {responsesByPersona.map((personaData) => (
            <Card key={`persona-${personaData.personaId}`}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {personaData.personaName}
                </CardTitle>
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
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SurveyResults;
