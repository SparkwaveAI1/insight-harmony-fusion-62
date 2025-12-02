import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ACPJobResults {
  study_results?: {
    personas_interviewed?: number;
    questions_asked?: number;
    selection_method?: string;
    responses?: Array<{
      persona_id: string;
      persona_name: string;
      persona_summary?: string;
      responses: Array<{
        question: string;
        response: string;
      }>;
    }>;
    summary_report?: {
      qualitative_report?: CompiledInsights;
    };
  };
}

interface ACPJob {
  id: string;
  external_job_id: string;
  status: string;
  results: ACPJobResults | null;
  created_at: string;
  completed_at: string | null;
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
    dominant_emotions: Array<{
      emotion: string;
      examples: string[];
      triggers: string[];
      intensity: string;
      persona_patterns: string;
    }> | string[];
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

interface ACPSurveyResultsProps {
  job: ACPJob;
}

export const ACPSurveyResults: React.FC<ACPSurveyResultsProps> = ({ job }) => {
  const [activeTab, setActiveTab] = useState('by-question');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const studyResults = job.results?.study_results;
  const responses = studyResults?.responses || [];
  const qualitativeReport = studyResults?.summary_report?.qualitative_report;

  // Extract unique questions from responses
  const questions = React.useMemo(() => {
    const questionSet = new Set<string>();
    responses.forEach(persona => {
      persona.responses.forEach(r => questionSet.add(r.question));
    });
    return Array.from(questionSet);
  }, [responses]);

  // Group responses by question
  const responsesByQuestion = questions.map((questionText, qIndex) => {
    const questionResponses = responses
      .map(persona => {
        const response = persona.responses.find(r => r.question === questionText);
        return response ? {
          personaId: persona.persona_id,
          personaName: persona.persona_name,
          responseText: response.response
        } : null;
      })
      .filter(Boolean);
    
    return {
      questionIndex: qIndex,
      questionText,
      responses: questionResponses
    };
  });

  // Group responses by persona
  const responsesByPersona = responses.map(persona => ({
    personaId: persona.persona_id,
    personaName: persona.persona_name,
    personaSummary: persona.persona_summary,
    responses: persona.responses.map((r, idx) => ({
      questionIndex: idx,
      questionText: r.question,
      responseText: r.response
    }))
  }));

  // Calculate totals
  const totalResponses = responses.reduce((acc, p) => acc + p.responses.length, 0);
  const totalPersonas = responses.length;

  // Export results
  const exportResults = () => {
    const results = {
      jobId: job.external_job_id,
      status: job.status,
      completedAt: job.completed_at,
      studyResults: job.results?.study_results,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acp-results-${job.external_job_id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully');
  };

  // Generate insights (calls compile-research-insights edge function)
  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('compile-acp-insights', {
        body: {
          acp_job_id: job.id,
          external_job_id: job.external_job_id
        }
      });

      if (error) {
        console.error('Error generating insights:', error);
        toast.error('Failed to generate insights. Please try again.');
        return;
      }

      toast.success('Insights generated! Refreshing page...');
      // Reload to show new insights
      window.location.reload();
    } catch (error) {
      console.error('Error during insight generation:', error);
      toast.error('Failed to generate insights. Please try again.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Research Results</h2>
          <p className="text-muted-foreground">
            Job ID: {job.external_job_id}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {totalResponses} total responses from {totalPersonas} personas
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportResults}>
            <Download className="w-4 h-4 mr-2" />
            Export Raw Data
          </Button>

          {!qualitativeReport && (
            <Button onClick={generateInsights} disabled={isGeneratingInsights}>
              <FileText className="w-4 h-4 mr-2" />
              {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="by-question">By Question</TabsTrigger>
          <TabsTrigger value="by-persona">By Persona</TabsTrigger>
        </TabsList>
        
        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6 mt-4">
          {qualitativeReport ? (
            <InsightsDisplay insights={qualitativeReport} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                AI insights are not yet available for this research.
              </p>
              <Button onClick={generateInsights} disabled={isGeneratingInsights}>
                <FileText className="w-4 h-4 mr-2" />
                {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* By Question Tab */}
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
                  questionData.responses.map((personaResponse: any) => (
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
        
        {/* By Persona Tab */}
        <TabsContent value="by-persona" className="space-y-6 mt-4">
          {responsesByPersona.length > 0 ? (
            responsesByPersona.map((personaData) => (
              <Card key={`persona-${personaData.personaId}`}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {personaData.personaName}
                  </CardTitle>
                  {personaData.personaSummary && (
                    <CardDescription className="whitespace-pre-wrap">
                      {personaData.personaSummary}
                    </CardDescription>
                  )}
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

// Separate component for insights display (mirrors SurveyResults exactly)
const InsightsDisplay: React.FC<{ insights: CompiledInsights }> = ({ insights }) => {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {insights.executive_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Key Findings</h4>
              <p className="text-sm text-muted-foreground">{insights.executive_summary.key_findings}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Research Objective Fulfillment</h4>
              <p className="text-sm text-muted-foreground">{insights.executive_summary.research_objective_fulfillment}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Actionable Insights</h4>
              <p className="text-sm text-muted-foreground">{insights.executive_summary.actionable_insights}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Thematic Analysis */}
      {insights.thematic_analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Thematic Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Themes */}
            {insights.thematic_analysis.primary_themes && insights.thematic_analysis.primary_themes.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Primary Themes</h4>
                <div className="space-y-4">
                  {insights.thematic_analysis.primary_themes.map((theme, index) => (
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
            {insights.thematic_analysis.emergent_themes && insights.thematic_analysis.emergent_themes.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Emergent Themes</h4>
                <div className="space-y-3">
                  {insights.thematic_analysis.emergent_themes.map((theme, index) => (
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
      {insights.behavioral_insights && (
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.behavioral_insights.personality_driven_patterns && insights.behavioral_insights.personality_driven_patterns.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Personality-Driven Patterns</h4>
                <div className="space-y-3">
                  {insights.behavioral_insights.personality_driven_patterns.map((pattern, index) => (
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

            {insights.behavioral_insights.demographic_influences && insights.behavioral_insights.demographic_influences.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Demographic Influences</h4>
                <div className="space-y-3">
                  {insights.behavioral_insights.demographic_influences.map((influence, index) => (
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
      {insights.consensus_and_divergence && (
        <Card>
          <CardHeader>
            <CardTitle>Consensus & Divergence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.consensus_and_divergence.strong_consensus && insights.consensus_and_divergence.strong_consensus.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-green-600">Strong Consensus</h4>
                <div className="space-y-2">
                  {insights.consensus_and_divergence.strong_consensus.map((consensus, index) => (
                    <div key={index} className="p-3 border border-green-200 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium">{consensus.topic}</p>
                      <p className="text-xs text-muted-foreground mt-1">{consensus.agreement_level} - {consensus.significance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.consensus_and_divergence.polarizing_topics && insights.consensus_and_divergence.polarizing_topics.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-amber-600">Polarizing Topics</h4>
                <div className="space-y-2">
                  {insights.consensus_and_divergence.polarizing_topics.map((topic, index) => (
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
      {insights.emotional_landscape && (
        <Card>
          <CardHeader>
            <CardTitle>Emotional Landscape</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.emotional_landscape.dominant_emotions && insights.emotional_landscape.dominant_emotions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Dominant Emotions</h4>
                  <div className="space-y-3">
                    {insights.emotional_landscape.dominant_emotions.map((emotion, index) => {
                      if (typeof emotion === 'string') {
                        return (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mr-2">
                            {emotion}
                          </span>
                        );
                      } else {
                        return (
                          <div key={index} className="p-3 border rounded-lg">
                            <h5 className="font-medium mb-2 text-blue-800">{emotion.emotion}</h5>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Intensity:</span> {emotion.intensity}
                              </div>
                              <div>
                                <span className="font-medium">Persona Patterns:</span> {emotion.persona_patterns}
                              </div>
                              {Array.isArray(emotion.triggers) && emotion.triggers.length > 0 && (
                                <div>
                                  <span className="font-medium">Triggers:</span>
                                  <ul className="list-disc list-inside ml-2 text-muted-foreground">
                                    {emotion.triggers.map((trigger, i) => (
                                      <li key={i}>{trigger}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {Array.isArray(emotion.examples) && emotion.examples.length > 0 && (
                                <div>
                                  <span className="font-medium">Examples:</span>
                                  <ul className="list-disc list-inside ml-2 text-muted-foreground">
                                    {emotion.examples.map((example, i) => (
                                      <li key={i}>"{example}"</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              )}
              {insights.emotional_landscape.emotional_journey && (
                <div>
                  <h4 className="font-medium mb-2">Emotional Journey</h4>
                  <p className="text-sm text-muted-foreground">{insights.emotional_landscape.emotional_journey}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actionable Recommendations */}
      {insights.actionable_recommendations && insights.actionable_recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actionable Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.actionable_recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Quality Assessment */}
      {insights.research_quality_assessment && (
        <Card>
          <CardHeader>
            <CardTitle>Research Quality Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Response Authenticity:</span>
                <p className="text-muted-foreground">{insights.research_quality_assessment.response_authenticity}</p>
              </div>
              <div>
                <span className="font-medium">Engagement Levels:</span>
                <p className="text-muted-foreground">{insights.research_quality_assessment.engagement_levels}</p>
              </div>
              <div>
                <span className="font-medium">Data Saturation:</span>
                <p className="text-muted-foreground">{insights.research_quality_assessment.data_saturation}</p>
              </div>
              <div>
                <span className="font-medium">Limitations:</span>
                <p className="text-muted-foreground">{insights.research_quality_assessment.limitations}</p>
              </div>
            </div>
            <div>
              <span className="font-medium">Recommendations:</span>
              <p className="text-muted-foreground text-sm">{insights.research_quality_assessment.recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {insights.metadata && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Analyzed:</span>
                <p className="text-muted-foreground">{new Date(insights.metadata.analyzed_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Total Responses:</span>
                <p className="text-muted-foreground">{insights.metadata.total_responses}</p>
              </div>
              <div>
                <span className="font-medium">Unique Personas:</span>
                <p className="text-muted-foreground">{insights.metadata.unique_personas}</p>
              </div>
              <div>
                <span className="font-medium">Questions:</span>
                <p className="text-muted-foreground">{insights.metadata.total_questions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ACPSurveyResults;
