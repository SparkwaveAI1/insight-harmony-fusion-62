
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

interface CompiledInsights {
  executive_summary?: {
    key_findings: string;
    research_objective_fulfillment: string;
    actionable_insights: string;
  };
  thematic_analysis?: {
    primary_themes: Array<{
      theme_name: string;
      description: string;
      prevalence: string;
      supporting_evidence: string[];
      sub_themes: string[];
      implications: string;
      document_connection?: string;
    }>;
    emergent_themes: Array<{
      theme_name: string;
      description: string;
      supporting_evidence: string[];
      research_value: string;
    }>;
  };
  behavioral_insights?: {
    personality_driven_patterns: Array<{
      trait_correlation: string;
      behavioral_prediction: string;
      examples: string[];
    }>;
    demographic_influences: Array<{
      demographic_factor: string;
      response_pattern: string;
      implications: string;
    }>;
  };
  consensus_and_divergence?: {
    strong_consensus: Array<{
      topic: string;
      agreement_level: string;
      significance: string;
    }>;
    polarizing_topics: Array<{
      topic: string;
      divisions: string;
      underlying_factors: string;
    }>;
  };
  emotional_landscape?: {
    dominant_emotions: string[];
    emotional_journey: string;
  };
  research_quality_assessment?: {
    response_authenticity: string;
    engagement_levels: string;
    data_saturation: string;
    limitations: string;
    recommendations: string;
  };
  actionable_recommendations?: string[];
  metadata?: {
    analyzed_at: string;
    total_responses: number;
    unique_personas: number;
    total_questions: number;
    model_used: string;
  };
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
  const [compiledInsights, setCompiledInsights] = useState<CompiledInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

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
        
        // Load compiled insights if available
        if (surveySessionId) {
          loadCompiledInsights(surveySessionId);
        }
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

  const loadCompiledInsights = async (sessionId: string) => {
    try {
      setIsLoadingInsights(true);
      const { data, error } = await supabase
        .from('research_reports')
        .select('insights')
        .eq('survey_session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading compiled insights:', error);
        return;
      }

      if (data && data.length > 0 && data[0].insights) {
        try {
          // Safely cast the insights data
          const insights = data[0].insights as unknown as CompiledInsights;
          setCompiledInsights(insights);
          console.log('Loaded compiled insights:', insights);
        } catch (error) {
          console.error('Error parsing compiled insights:', error);
        }
      }
    } catch (error) {
      console.error('Error loading compiled insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

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
    <div className="container mx-auto px-6 py-8 space-y-6">
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="by-question">By Question</TabsTrigger>
          <TabsTrigger value="by-persona">By Persona</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-6 mt-4">
          {isLoadingInsights ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading AI insights...</p>
              </div>
            </div>
          ) : compiledInsights ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              {compiledInsights.executive_summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Key Findings</h4>
                      <p className="text-sm text-muted-foreground">{compiledInsights.executive_summary.key_findings}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Research Objective Fulfillment</h4>
                      <p className="text-sm text-muted-foreground">{compiledInsights.executive_summary.research_objective_fulfillment}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Actionable Insights</h4>
                      <p className="text-sm text-muted-foreground">{compiledInsights.executive_summary.actionable_insights}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Thematic Analysis */}
              {compiledInsights.thematic_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thematic Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Primary Themes */}
                    {compiledInsights.thematic_analysis.primary_themes && compiledInsights.thematic_analysis.primary_themes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Primary Themes</h4>
                        <div className="space-y-4">
                          {compiledInsights.thematic_analysis.primary_themes.map((theme, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <h5 className="font-medium mb-2">{theme.theme_name}</h5>
                              <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium">Prevalence:</span> {theme.prevalence}
                                </div>
                                <div>
                                  <span className="font-medium">Implications:</span> {theme.implications}
                                </div>
                              </div>
                              {theme.supporting_evidence && theme.supporting_evidence.length > 0 && (
                                <div className="mt-3">
                                  <span className="font-medium text-sm">Supporting Evidence:</span>
                                  <ul className="list-disc list-inside mt-1 text-xs text-muted-foreground space-y-1">
                                    {theme.supporting_evidence.map((evidence, i) => (
                                      <li key={i}>"{evidence}"</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emergent Themes */}
                    {compiledInsights.thematic_analysis.emergent_themes && compiledInsights.thematic_analysis.emergent_themes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Emergent Themes</h4>
                        <div className="space-y-3">
                          {compiledInsights.thematic_analysis.emergent_themes.map((theme, index) => (
                            <div key={index} className="p-3 bg-muted rounded-lg">
                              <h5 className="font-medium mb-1">{theme.theme_name}</h5>
                              <p className="text-sm text-muted-foreground mb-2">{theme.description}</p>
                              <p className="text-xs text-muted-foreground"><strong>Research Value:</strong> {theme.research_value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Behavioral Insights */}
              {compiledInsights.behavioral_insights && (
                <Card>
                  <CardHeader>
                    <CardTitle>Behavioral Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {compiledInsights.behavioral_insights.personality_driven_patterns && compiledInsights.behavioral_insights.personality_driven_patterns.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Personality-Driven Patterns</h4>
                        <div className="space-y-3">
                          {compiledInsights.behavioral_insights.personality_driven_patterns.map((pattern, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <p className="text-sm mb-2"><strong>Trait Correlation:</strong> {pattern.trait_correlation}</p>
                              <p className="text-sm mb-2"><strong>Behavioral Prediction:</strong> {pattern.behavioral_prediction}</p>
                              {pattern.examples && pattern.examples.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  <strong>Examples:</strong> {pattern.examples.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {compiledInsights.behavioral_insights.demographic_influences && compiledInsights.behavioral_insights.demographic_influences.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Demographic Influences</h4>
                        <div className="space-y-3">
                          {compiledInsights.behavioral_insights.demographic_influences.map((influence, index) => (
                            <div key={index} className="p-3 bg-muted rounded-lg">
                              <p className="text-sm mb-1"><strong>{influence.demographic_factor}:</strong> {influence.response_pattern}</p>
                              <p className="text-xs text-muted-foreground">{influence.implications}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Consensus and Divergence */}
              {compiledInsights.consensus_and_divergence && (
                <Card>
                  <CardHeader>
                    <CardTitle>Consensus & Divergence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {compiledInsights.consensus_and_divergence.strong_consensus && compiledInsights.consensus_and_divergence.strong_consensus.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-green-600">Strong Consensus</h4>
                        <div className="space-y-2">
                          {compiledInsights.consensus_and_divergence.strong_consensus.map((consensus, index) => (
                            <div key={index} className="p-3 border border-green-200 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium">{consensus.topic}</p>
                              <p className="text-xs text-muted-foreground mt-1">{consensus.agreement_level} - {consensus.significance}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {compiledInsights.consensus_and_divergence.polarizing_topics && compiledInsights.consensus_and_divergence.polarizing_topics.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-amber-600">Polarizing Topics</h4>
                        <div className="space-y-2">
                          {compiledInsights.consensus_and_divergence.polarizing_topics.map((topic, index) => (
                            <div key={index} className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                              <p className="text-sm font-medium">{topic.topic}</p>
                              <p className="text-xs text-muted-foreground mt-1">{topic.divisions}</p>
                              <p className="text-xs text-muted-foreground">{topic.underlying_factors}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Emotional Landscape */}
              {compiledInsights.emotional_landscape && (
                <Card>
                  <CardHeader>
                    <CardTitle>Emotional Landscape</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {compiledInsights.emotional_landscape.dominant_emotions && compiledInsights.emotional_landscape.dominant_emotions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Dominant Emotions</h4>
                          <div className="flex flex-wrap gap-2">
                            {compiledInsights.emotional_landscape.dominant_emotions.map((emotion, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {emotion}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {compiledInsights.emotional_landscape.emotional_journey && (
                        <div>
                          <h4 className="font-medium mb-2">Emotional Journey</h4>
                          <p className="text-sm text-muted-foreground">{compiledInsights.emotional_landscape.emotional_journey}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actionable Recommendations */}
              {compiledInsights.actionable_recommendations && compiledInsights.actionable_recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actionable Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {compiledInsights.actionable_recommendations.map((recommendation, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Research Quality Assessment */}
              {compiledInsights.research_quality_assessment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Research Quality Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Response Authenticity:</span>
                        <p className="text-muted-foreground">{compiledInsights.research_quality_assessment.response_authenticity}</p>
                      </div>
                      <div>
                        <span className="font-medium">Engagement Levels:</span>
                        <p className="text-muted-foreground">{compiledInsights.research_quality_assessment.engagement_levels}</p>
                      </div>
                      <div>
                        <span className="font-medium">Data Saturation:</span>
                        <p className="text-muted-foreground">{compiledInsights.research_quality_assessment.data_saturation}</p>
                      </div>
                      <div>
                        <span className="font-medium">Limitations:</span>
                        <p className="text-muted-foreground">{compiledInsights.research_quality_assessment.limitations}</p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Recommendations:</span>
                      <p className="text-muted-foreground text-sm">{compiledInsights.research_quality_assessment.recommendations}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {compiledInsights.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Analyzed:</span>
                        <p className="text-muted-foreground">{new Date(compiledInsights.metadata.analyzed_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Total Responses:</span>
                        <p className="text-muted-foreground">{compiledInsights.metadata.total_responses}</p>
                      </div>
                      <div>
                        <span className="font-medium">Unique Personas:</span>
                        <p className="text-muted-foreground">{compiledInsights.metadata.unique_personas}</p>
                      </div>
                      <div>
                        <span className="font-medium">Questions:</span>
                        <p className="text-muted-foreground">{compiledInsights.metadata.total_questions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                AI insights are not yet available for this survey.
              </p>
              <Button 
                onClick={() => surveySessionId && loadCompiledInsights(surveySessionId)}
                disabled={!surveySessionId}
              >
                Refresh Insights
              </Button>
            </div>
          )}
        </TabsContent>
        
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
