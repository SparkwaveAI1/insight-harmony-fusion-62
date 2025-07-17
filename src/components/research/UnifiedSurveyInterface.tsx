
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Plus, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { dbPersonaToPersona } from '@/services/persona/mappers';
import { useResearchSession } from './hooks/useResearchSession';
import { AutomatedSurveyExecution } from './AutomatedSurveyExecution';
import SurveyResults from './SurveyResults';

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
  const projectId = searchParams.get('project');
  
  const [currentStep, setCurrentStep] = useState<'setup' | 'execution' | 'results'>('setup');
  const [surveyData, setSurveyData] = useState<SurveyData>({
    name: '',
    description: '',
    questions: ['']
  });
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    sessionId,
    loadedPersonas,
    projectDocuments,
    createSession,
    sendMessage,
    sendToPersona
  } = useResearchSession(projectId || undefined);

  // Load available personas
  useEffect(() => {
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

    loadPersonas();
  }, []);

  const addQuestion = () => {
    setSurveyData(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };

  const removeQuestion = (index: number) => {
    if (surveyData.questions.length > 1) {
      setSurveyData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateQuestion = (index: number, value: string) => {
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? value : q)
    }));
  };

  const togglePersonaSelection = (personaId: string) => {
    setSelectedPersonas(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const saveSurveyDefinition = async (surveyData: SurveyData): Promise<string | null> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Authentication error:', userError);
        toast.error('Authentication required');
        return null;
      }

      if (!projectId) {
        console.error('Project ID is required');
        toast.error('Project ID is required');
        return null;
      }

      const { data: survey, error } = await supabase
        .from('research_surveys')
        .insert({
          name: surveyData.name.trim(),
          description: surveyData.description.trim() || null,
          questions: surveyData.questions.filter(q => q.trim()),
          project_id: projectId,
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
      // Step 1: Save survey definition to database
      console.log('Saving survey definition...');
      const surveyId = await saveSurveyDefinition(surveyData);
      
      if (!surveyId) {
        toast.error('Failed to save survey definition');
        return;
      }

      // Update survey data with the saved ID
      setSurveyData(prev => ({ ...prev, id: surveyId }));

      // Step 2: Create research session
      console.log('Creating research session...');
      const success = await createSession(selectedPersonas, projectId || undefined);
      
      if (success) {
        setCurrentStep('execution');
        toast.success('Survey session created successfully');
      } else {
        toast.error('Failed to create survey session');
      }
    } catch (error) {
      console.error('Error starting survey:', error);
      toast.error('Failed to start survey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurveyComplete = () => {
    setCurrentStep('results');
  };

  const handleBackToSetup = () => {
    setCurrentStep('setup');
  };

  if (currentStep === 'execution') {
    return (
      <AutomatedSurveyExecution
        surveyData={surveyData}
        selectedPersonas={selectedPersonas}
        loadedPersonas={loadedPersonas}
        sessionId={sessionId}
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
        </div>
        
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Research
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Survey Details
            </CardTitle>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Questions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </div>
              
              {surveyData.questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      placeholder={`Question ${index + 1}...`}
                      rows={2}
                    />
                  </div>
                  {surveyData.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
          {isLoading ? 'Creating Survey...' : 'Start Automated Survey'}
        </Button>
      </div>
    </div>
  );
};

export default UnifiedSurveyInterface;
