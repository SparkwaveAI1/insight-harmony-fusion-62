import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Save, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useResearchSession } from './hooks/useResearchSession';
import { SequentialSurveyExecution } from './SequentialSurveyExecution';
import SurveyResults from './SurveyResults';
import { createSurveySession, updateSurveySessionStatus } from './services/surveySessionService';
import { QuestionUpload, SurveyQuestion } from './QuestionUpload';
import ProjectSelector from './ProjectSelector';
import DocumentManager from './DocumentManager';
import { PersonaSourceSelector } from './PersonaSourceSelector';
import { KnowledgeBaseDocument } from '@/services/collections';
import { getProjectQuestionSets, saveQuestionSet, ProjectQuestionSet } from '@/services/questionSets/questionSetService';

interface UnifiedSurveyInterfaceProps {
  onBack?: () => void;
}

interface SurveyData {
  id?: string;
  name: string;
  description: string;
  questions: string[];
  surveyQuestions?: SurveyQuestion[];
}

const UnifiedSurveyInterface: React.FC<UnifiedSurveyInterfaceProps> = ({ onBack }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');
  
  const [currentStep, setCurrentStep] = useState<'project-selection' | 'setup' | 'execution' | 'results'>('project-selection');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    name: '',
    description: '',
    questions: [''],
    surveyQuestions: [{ text: '' }]
  });
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [surveySessionId, setSurveySessionId] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [availableQuestionSets, setAvailableQuestionSets] = useState<ProjectQuestionSet[]>([]);
  const [showSaveQuestionSet, setShowSaveQuestionSet] = useState(false);
  const [questionSetName, setQuestionSetName] = useState('');

  const {
    sessionId,
    loadedPersonas,
    projectDocuments,
    createSession,
    sendMessage,
    sendToPersona
  } = useResearchSession(selectedProjectId || undefined);

  // If project is already selected from URL, skip project selection
  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
      setCurrentStep('setup');
    }
  }, [projectId]);

  // Load question sets when project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadQuestionSets();
    } else {
      setAvailableQuestionSets([]);
    }
  }, [selectedProjectId]);

  const loadQuestionSets = async () => {
    if (!selectedProjectId) return;
    const questionSets = await getProjectQuestionSets(selectedProjectId);
    setAvailableQuestionSets(questionSets);
  };

  const handleProjectSelected = (projectId: string) => {
    setSelectedProjectId(projectId || null);
    
    // Update URL to reflect project selection
    if (projectId) {
      navigate(`/research?project=${projectId}`, { replace: true });
    } else {
      navigate('/research', { replace: true });
    }
    
    setCurrentStep('setup');
  };

  const handlePersonaSelectionChange = (personaIds: string[]) => {
    setSelectedPersonas(personaIds);
  };

  const handleQuestionsChange = (newQuestions: string[]) => {
    setSurveyData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleSurveyQuestionsChange = (newSurveyQuestions: SurveyQuestion[]) => {
    setSurveyData(prev => ({
      ...prev,
      surveyQuestions: newSurveyQuestions,
      questions: newSurveyQuestions.map(q => q.text)
    }));
  };

  const saveSurveyDefinition = async (surveyData: SurveyData): Promise<string | null> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Authentication error:', userError);
        toast.error('Authentication required');
        return null;
      }

      let actualProjectId = selectedProjectId;
      
      if (!actualProjectId) {
        console.log('No project selected, creating default project...');
        const { data: defaultProject, error: projectError } = await supabase
          .from('projects')
          .insert({
            name: 'Survey Project',
            description: 'Auto-created project for survey',
            user_id: user.id
          })
          .select()
          .single();

        if (projectError) {
          console.error('Error creating default project:', projectError);
          toast.error('Failed to create project for survey');
          return null;
        }

        actualProjectId = defaultProject.id;
        console.log('Created default project:', actualProjectId);
      }

      const { data: survey, error } = await supabase
        .from('research_surveys')
        .insert({
          name: surveyData.name.trim(),
          description: surveyData.description.trim() || null,
          questions: surveyData.questions.filter(q => q.trim()),
          project_id: actualProjectId,
          user_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving survey:', error);
        toast.error(`Failed to save survey: ${error.message}`);
        return null;
      }

      console.log('Survey saved successfully:', survey.id);
      return survey.id;
    } catch (error) {
      console.error('Error saving survey definition:', error);
      toast.error('Failed to save survey definition');
      return null;
    }
  };

  const startSurvey = async () => {
    if (!surveyData.name.trim()) {
      toast.error('Please enter a survey name');
      return;
    }

    if (surveyData.questions.some(q => !q.trim())) {
      toast.error('Please fill in all questions');
      return;
    }

    if (selectedPersonas.length === 0) {
      toast.error('Please select at least one persona');
      return;
    }

    if (selectedPersonas.length > 10) {
      toast.error('Please select no more than 10 personas for surveys');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Saving survey definition...');
      const surveyId = await saveSurveyDefinition(surveyData);
      
      if (!surveyId) {
        toast.error('Failed to save survey definition');
        return;
      }

      setSurveyData(prev => ({ ...prev, id: surveyId }));

      console.log('Creating survey session tracking...');
      const sessionTrackingId = await createSurveySession(surveyId, selectedPersonas);
      
      if (!sessionTrackingId) {
        toast.error('Failed to create survey session tracking');
        return;
      }
      
      setSurveySessionId(sessionTrackingId);
      console.log('Survey session ID set to:', sessionTrackingId);

      // Process selected documents for research context
      const documentsToProcess = selectedDocuments.length > 0 ? selectedDocuments : projectDocuments;
      if (documentsToProcess.length > 0) {
        console.log('Processing project documents for research context...');
        try {
          const { data: contextData, error: contextError } = await supabase.functions.invoke('prepare-research-context', {
            body: {
              documents: documentsToProcess,
              surveyName: surveyData.name,
              surveyDescription: surveyData.description
            }
          });

          if (contextError) {
            console.error('Error processing research context:', contextError);
            toast.error('Failed to process project documents');
            return;
          }

          if (contextData?.research_context) {
            console.log('Storing processed research context...');
            const { error: updateError } = await supabase
              .from('research_survey_sessions')
              .update({ research_context: contextData.research_context })
              .eq('id', sessionTrackingId);

            if (updateError) {
              console.error('Error storing research context:', updateError);
              toast.error('Failed to store research context');
              return;
            }
            
            console.log('Research context processed and stored successfully');
          }
        } catch (docError) {
          console.error('Error processing documents:', docError);
          toast.error('Failed to process project documents');
          return;
        }
      }

      console.log('Creating research session...');
      const success = await createSession(selectedPersonas, selectedProjectId || undefined);
      
      if (success) {
        if (sessionId) {
          await updateSurveySessionStatus(sessionTrackingId, 'active', sessionId);
        }
        
        setCurrentStep('execution');
        toast.success('Survey session created successfully');
      } else {
        if (sessionTrackingId) {
          await updateSurveySessionStatus(sessionTrackingId, 'cancelled');
        }
        toast.error('Failed to create survey session');
      }
    } catch (error) {
      console.error('Error starting survey:', error);
      toast.error('Failed to start survey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurveyComplete = async () => {
    if (surveySessionId) {
      await updateSurveySessionStatus(surveySessionId, 'completed');
      
      // Trigger insight compilation
      try {
        console.log('Compiling research insights...');
        const { data, error } = await supabase.functions.invoke('compile-research-insights', {
          body: {
            survey_session_id: surveySessionId,
            user_id: (await supabase.auth.getUser()).data.user?.id
          }
        });

        if (error) {
          console.error('Error compiling insights:', error);
          toast.error('Failed to compile insights, but survey results are available');
        } else {
          console.log('Insights compiled successfully:', data);
          toast.success('Survey completed and insights compiled!');
        }
      } catch (error) {
        console.error('Error during insight compilation:', error);
        toast.error('Failed to compile insights, but survey results are available');
      }
    }
    setCurrentStep('results');
  };

  const handleBackToSetup = () => {
    setCurrentStep('setup');
  };

  const handleBackToProjectSelection = () => {
    setCurrentStep('project-selection');
  };

  const handleSaveQuestionSet = async () => {
    if (!selectedProjectId || !questionSetName.trim()) {
      toast.error('Please enter a name for the question set');
      return;
    }

    const result = await saveQuestionSet(
      selectedProjectId,
      questionSetName.trim(),
      surveyData.questions.filter(q => q.trim())
    );

    if (result) {
      setQuestionSetName('');
      setShowSaveQuestionSet(false);
      await loadQuestionSets();
    }
  };

  const handleLoadQuestionSet = (questionSet: ProjectQuestionSet) => {
    setSurveyData(prev => ({
      ...prev,
      questions: questionSet.questions,
      surveyQuestions: questionSet.questions.map(text => ({ text }))
    }));
    toast.success(`Loaded question set: ${questionSet.name}`);
  };

  // Project Selection Step
  if (currentStep === 'project-selection') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Survey Setup</h1>
            <p className="text-muted-foreground">
              Choose a project to save your survey results, or continue without saving
            </p>
          </div>
          
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Research
            </Button>
          )}
        </div>

        <ProjectSelector
          onProjectSelected={handleProjectSelected}
          showCreateOption={true}
        />
      </div>
    );
  }

  if (currentStep === 'execution') {
    return (
      <SequentialSurveyExecution
        surveyData={surveyData}
        selectedPersonas={selectedPersonas}
        loadedPersonas={loadedPersonas}
        sessionId={sessionId}
        surveySessionId={surveySessionId}
        projectDocuments={projectDocuments}
        sendMessage={sendMessage}
        sendToPersona={sendToPersona}
        onComplete={handleSurveyComplete}
        onBack={handleBackToSetup}
      />
    );
  }

  if (currentStep === 'results') {
    return (
      <SurveyResults
        surveyName={surveyData.name}
        surveyDescription={surveyData.description}
        questions={surveyData.questions}
        sessionId={sessionId!}
        surveySessionId={surveySessionId}
        loadedPersonas={loadedPersonas as any}
        onBack={handleBackToSetup}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Survey</h1>
          <p className="text-muted-foreground">
            Set up an automated survey to collect responses from multiple personas
          </p>
          {selectedProjectId && (
            <p className="text-sm text-green-600 mt-1">
              Connected to project - results will be saved
            </p>
          )}
          {!selectedProjectId && (
            <p className="text-sm text-amber-600 mt-1">
              No project selected - results can be exported but not saved
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackToProjectSelection}>
            Change Project
          </Button>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Research
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="survey-name">Survey Name</Label>
                <Input
                  id="survey-name"
                  value={surveyData.name}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Product Feedback Survey"
                />
              </div>
              
              <div>
                <Label htmlFor="survey-description">Description (Optional)</Label>
                <Textarea
                  id="survey-description"
                  value={surveyData.description}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the survey purpose..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <QuestionUpload
            questions={surveyData.questions}
            onQuestionsChange={handleQuestionsChange}
            surveyQuestions={surveyData.surveyQuestions}
            onSurveyQuestionsChange={handleSurveyQuestionsChange}
          />

          {selectedProjectId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Question Sets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableQuestionSets.length > 0 && (
                  <div>
                    <Label>Load Saved Question Set</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {availableQuestionSets.map((questionSet) => (
                        <Button
                          key={questionSet.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadQuestionSet(questionSet)}
                          className="justify-start"
                        >
                          <Bookmark className="w-3 h-3 mr-2" />
                          {questionSet.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {!showSaveQuestionSet && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveQuestionSet(true)}
                    disabled={surveyData.questions.filter(q => q.trim()).length === 0}
                  >
                    <Save className="w-3 h-3 mr-2" />
                    Save Current Questions
                  </Button>
                )}

                {showSaveQuestionSet && (
                  <div className="space-y-2">
                    <Label>Question Set Name</Label>
                    <div className="flex gap-2">
                      <Input
                        value={questionSetName}
                        onChange={(e) => setQuestionSetName(e.target.value)}
                        placeholder="e.g., Product Feedback Questions"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleSaveQuestionSet}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowSaveQuestionSet(false);
                          setQuestionSetName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <PersonaSourceSelector
          projectId={selectedProjectId || undefined}
          selectedPersonas={selectedPersonas}
          onPersonaSelectionChange={handlePersonaSelectionChange}
          maxPersonas={10}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={startSurvey}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {isLoading ? 'Creating Survey...' : 'Start Sequential Survey'}
        </Button>
      </div>
    </div>
  );
};

export default UnifiedSurveyInterface;
