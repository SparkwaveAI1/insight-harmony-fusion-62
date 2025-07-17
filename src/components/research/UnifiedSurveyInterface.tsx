import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X, Upload, FileText, Play, Users, Download } from 'lucide-react';
import { PersonaLoader } from './PersonaLoader';
import { AutomatedSurveyExecution } from './AutomatedSurveyExecution';
import { useResearchSession } from './hooks/useResearchSession';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface SurveyTemplate {
  name: string;
  description: string;
  questions: string[];
}

interface UnifiedSurveyInterfaceProps {
  onBack?: () => void;
}

const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    name: "Product Feedback",
    description: "Gather user feedback on products or services",
    questions: [
      "What is your overall impression of this product/service?",
      "What features do you find most valuable?",
      "What improvements would you suggest?",
      "How likely are you to recommend this to others?",
      "What concerns or issues do you have?"
    ]
  },
  {
    name: "User Experience",
    description: "Evaluate user experience and usability",
    questions: [
      "How easy was it to complete your intended task?",
      "What was the most confusing part of the experience?",
      "What did you like most about the interface?",
      "How would you improve the user experience?",
      "Did anything surprise you during your interaction?"
    ]
  },
  {
    name: "Brand Perception",
    description: "Understand how your brand is perceived",
    questions: [
      "What comes to mind when you think of this brand?",
      "How does this brand compare to competitors?",
      "What values do you associate with this brand?",
      "What would make you more likely to choose this brand?",
      "How does this brand make you feel?"
    ]
  }
];

const UnifiedSurveyInterface: React.FC<UnifiedSurveyInterfaceProps> = ({ onBack }) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  // Survey setup state
  const [surveyName, setSurveyName] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'setup' | 'personas' | 'execution'>('setup');
  
  // CSV import state
  const [csvQuestions, setCsvQuestions] = useState<string[]>([]);
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  // Research session hook
  const {
    sessionId,
    loadedPersonas,
    projectDocuments,
    messages,
    isLoading,
    createSession,
    sendMessage,
    sendToPersona
  } = useResearchSession(projectId || undefined);

  // Question management functions
  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  // Template loading
  const loadTemplate = (template: SurveyTemplate) => {
    setSurveyName(template.name);
    setSurveyDescription(template.description);
    setQuestions(template.questions);
    toast.success(`${template.name} template has been loaded.`);
  };

  // CSV import handling
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const importedQuestions = lines.map(line => {
          // Handle CSV format - remove quotes and escape characters
          return line.replace(/^"(.*)"$/, '$1').replace(/""/g, '"').trim();
        }).filter(q => q.length > 0);

        if (importedQuestions.length > 0) {
          setCsvQuestions(importedQuestions);
          setShowCsvUpload(true);
          toast.success(`Found ${importedQuestions.length} questions in CSV file`);
        } else {
          toast.error('No valid questions found in CSV file');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  };

  const importCsvQuestions = () => {
    setQuestions(csvQuestions);
    setShowCsvUpload(false);
    setCsvQuestions([]);
    toast.success(`Imported ${csvQuestions.length} questions from CSV`);
  };

  // Validation
  const isSetupValid = () => {
    return surveyName.trim() !== '' && 
           questions.filter(q => q.trim() !== '').length > 0;
  };

  // Step navigation
  const handleContinueToPersonas = () => {
    if (!isSetupValid()) {
      toast.error('Please provide a survey name and at least one question');
      return;
    }
    setCurrentStep('personas');
  };

  const handleStartSurvey = async (personas: string[]): Promise<boolean> => {
    console.log('Starting automated survey with personas:', personas);
    setSelectedPersonas(personas);
    
    // Create research session with selected personas
    const success = await createSession(personas, projectId || undefined);
    if (success) {
      setCurrentStep('execution');
      toast.success('Automated survey started!');
      return true;
    } else {
      toast.error('Failed to start survey session');
      return false;
    }
  };

  const handleSurveyComplete = () => {
    toast.success('Survey completed successfully!');
    // Could navigate to results page or reset
  };

  // Step 1: Survey Setup
  if (currentStep === 'setup') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create Survey</h1>
            <p className="text-muted-foreground">
              Set up your survey questions and configuration
            </p>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SURVEY_TEMPLATES.map((template, index) => (
                <div key={index} className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                     onClick={() => loadTemplate(template)}>
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <p className="text-xs text-muted-foreground">{template.questions.length} questions</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Survey Details */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="survey-name">Survey Name *</Label>
              <Input
                id="survey-name"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                placeholder="Enter survey name"
              />
            </div>
            <div>
              <Label htmlFor="survey-description">Description (Optional)</Label>
              <Textarea
                id="survey-description"
                value={surveyDescription}
                onChange={(e) => setSurveyDescription(e.target.value)}
                placeholder="Describe the purpose of this survey"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Survey Questions</CardTitle>
              <div className="flex gap-2">
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                    </span>
                  </Button>
                </Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`question-${index}`} className="text-sm">
                    Question {index + 1}
                  </Label>
                  <Textarea
                    id={`question-${index}`}
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    placeholder="Enter your question"
                    rows={2}
                  />
                </div>
                {questions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="mt-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CSV Import Dialog */}
        {showCsvUpload && (
          <Card>
            <CardHeader>
              <CardTitle>Import Questions from CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {csvQuestions.length} questions. Preview:
              </p>
              <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-1">
                {csvQuestions.slice(0, 5).map((q, i) => (
                  <p key={i} className="text-sm">{i + 1}. {q}</p>
                ))}
                {csvQuestions.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ... and {csvQuestions.length - 5} more questions
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={importCsvQuestions}>
                  Import Questions
                </Button>
                <Button variant="outline" onClick={() => setShowCsvUpload(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleContinueToPersonas}
            disabled={!isSetupValid()}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Continue to Persona Selection
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Persona Selection
  if (currentStep === 'personas') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Select Personas</h1>
            <p className="text-muted-foreground">
              Choose up to 10 personas for your automated survey: "{surveyName}"
            </p>
          </div>
          <Button variant="outline" onClick={() => setCurrentStep('setup')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Setup
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Survey Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Survey Name:</span>
                <span>{surveyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Questions:</span>
                <span>{questions.filter(q => q.trim()).length}</span>
              </div>
              {projectDocuments.length > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Knowledge Base:</span>
                  <span>{projectDocuments.length} document{projectDocuments.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <PersonaLoader
          maxPersonas={10}
          onStartSession={handleStartSurvey}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Step 3: Automated Execution
  if (currentStep === 'execution') {
    const surveyData = {
      name: surveyName,
      description: surveyDescription,
      questions: questions.filter(q => q.trim() !== '')
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        <AutomatedSurveyExecution
          surveyData={surveyData}
          selectedPersonas={selectedPersonas}
          loadedPersonas={loadedPersonas}
          sessionId={sessionId}
          projectDocuments={projectDocuments}
          sendMessage={sendMessage}
          sendToPersona={sendToPersona}
          onComplete={handleSurveyComplete}
          onBack={() => setCurrentStep('personas')}
        />
      </div>
    );
  }

  return null;
};

export default UnifiedSurveyInterface;
