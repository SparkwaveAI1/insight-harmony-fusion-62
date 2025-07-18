import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { dbPersonaToPersona } from '@/services/persona/mappers';
import { useResearchSession } from './hooks/useResearchSession';
import { SequentialSurveyExecution } from './SequentialSurveyExecution';
import SurveyResults from './SurveyResults';
import { createSurveySession, updateSurveySessionStatus } from './services/surveySessionService';
import { QuestionUpload } from './QuestionUpload';
import ProjectSelector from './ProjectSelector';

interface UnifiedSurveyInterfaceProps {
  onBack?: () => void;
}

interface SurveyData {
  id?: string;
  name: string;
  description: string;
  questions: string[];
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
    questions: ['']
  });
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [surveySessionId, setSurveySessionId] = useState<string | null>(null);

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

  // Load available personas
  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const { data: personasData, error } = await supabase
        .from('personas')
        .select('*')
        .or('is_public.eq.true,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error loading personas:', error);
        return;
      }

      const mappedPersonas = personasData.map(dbPersonaToPersona);
      setAvailablePersonas(mappedPersonas);
    } catch (error) {
      console.error('Error loading personas:', error);
    }
  };

  const handleProjectSelected = (projectId: string) => {
    setSelectedProjectId(projectId || null);
    setCurrentStep('setup');
  };

  const togglePersonaSelection = (personaId: string) => {
    setSelectedPersonas(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const handleQuestionsChange = (newQuestions: string[]) => {
    setSurveyData(prev => ({
      ...prev,
      questions: newQuestions
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
    }
    setCurrentStep('results');
  };

  const handleBackToSetup = () => {
    setCurrentStep('setup');
  };

  const handleBackToProjectSelection = () => {
    setCurrentStep('project-selection');
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
        loadedPersonas={loadedPersonas}
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
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Personas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose up to 10 personas to participate in this survey
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availablePersonas.map((persona) => (
                <div
                  key={persona.persona_id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPersonas.includes(persona.persona_id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => togglePersonaSelection(persona.persona_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{persona.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {persona.description || 'No description'}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 ${
                      selectedPersonas.includes(persona.persona_id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPersonas.includes(persona.persona_id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              {selectedPersonas.length} of 10 personas selected
            </div>
          </CardContent>
        </Card>
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
