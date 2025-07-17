
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PersonaLoader } from './PersonaLoader';
import { ResearchSurveyExecution } from './ResearchSurveyExecution';
import ProjectSelector from './ProjectSelector';
import { useResearchSession } from './hooks/useResearchSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, FileUp, Upload, FileText, Image, Globe, FileCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SurveyData {
  name: string;
  description?: string;
  questions: string[];
}

interface UnifiedSurveyInterfaceProps {
  onBack?: () => void;
}

const UnifiedSurveyInterface: React.FC<UnifiedSurveyInterfaceProps> = ({ onBack }) => {
  const [step, setStep] = useState<'build' | 'personas' | 'execution'>('build');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Survey form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [showCSVDialog, setShowCSVDialog] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Initialize project from URL params
  React.useEffect(() => {
    const urlProjectId = searchParams.get('project');
    console.log('URL Project ID detected:', urlProjectId);
    if (urlProjectId) {
      setProjectId(urlProjectId);
      console.log('Project ID set to:', urlProjectId);
    }
  }, [searchParams]);

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
  const loadTemplate = (template: 'product' | 'message' | 'ux' | 'policy') => {
    const templates = {
      product: {
        name: 'Product Feedback Survey',
        description: 'Gather feedback on product features and usability',
        questions: [
          'What is your first impression of this product?',
          'What features do you find most valuable?',
          'What concerns or hesitations do you have about using this product?',
          'How does this product compare to alternatives you\'ve used?',
          'What would convince you to recommend this product to others?'
        ]
      },
      message: {
        name: 'Message Testing Survey',
        description: 'Test messaging effectiveness and clarity',
        questions: [
          'What is the main message you understand from this content?',
          'How does this message make you feel?',
          'What questions or concerns does this message raise for you?',
          'How credible or trustworthy does this message seem?',
          'What would improve this message for you?'
        ]
      },
      ux: {
        name: 'UX Testing Survey',
        description: 'Evaluate user experience and interface design',
        questions: [
          'How easy is it to understand what this interface does?',
          'What would you expect to happen when you interact with this?',
          'What feels confusing or unclear about this design?',
          'How would you describe this experience to someone else?',
          'What would make this interface work better for you?'
        ]
      },
      policy: {
        name: 'Policy Response Survey',
        description: 'Assess reactions to policy proposals or changes',
        questions: [
          'What is your initial reaction to this policy proposal?',
          'How might this policy affect you personally?',
          'What concerns do you have about this policy?',
          'What aspects of this policy do you support or oppose?',
          'How would you want this policy to be modified?'
        ]
      }
    };

    const template_data = templates[template];
    setName(template_data.name);
    setDescription(template_data.description);
    setQuestions(template_data.questions);
    toast({
      title: "Template Loaded",
      description: `${template_data.name} template has been loaded.`,
    });
  };

  // CSV import handling
  const parseCSVContent = (content: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        setPreviewQuestions([]);
        return;
      }

      const isHeader = lines[0].toLowerCase().includes('question') || 
                      lines[0].toLowerCase().includes('text') ||
                      !lines[0].includes(',');
      
      const dataLines = isHeader ? lines.slice(1) : lines;
      
      const questions = dataLines
        .map(line => {
          const firstColumn = line.split(',')[0];
          return firstColumn.replace(/^["']|["']$/g, '').trim();
        })
        .filter(q => q.length > 0)
        .slice(0, 50);

      setPreviewQuestions(questions);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Parse Error",
        description: "Failed to parse CSV content. Please check the format.",
        variant: "destructive",
      });
      setPreviewQuestions([]);
    }
  };

  const handleCSVImport = () => {
    if (previewQuestions.length === 0) {
      toast({
        title: "No Questions Found",
        description: "No valid questions found in CSV content.",
        variant: "destructive",
      });
      return;
    }

    setQuestions(previewQuestions);
    setCsvContent('');
    setPreviewQuestions([]);
    setShowCSVDialog(false);
    toast({
      title: "CSV Imported",
      description: `Successfully imported ${previewQuestions.length} questions.`,
    });
  };

  // File upload handling
  const handleFileUpload = async (file: File, purpose: string) => {
    if (!projectId) {
      toast({
        title: "Project Required",
        description: "Please select a project before uploading files.",
        variant: "destructive",
      });
      return;
    }

    setUploadingFiles(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file to storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(`${projectId}/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(`${projectId}/${fileName}`);

      // Save document metadata
      const { error: dbError } = await supabase
        .from('knowledge_base_documents')
        .insert({
          project_id: projectId,
          title: `${purpose}: ${file.name}`,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id,
          content: purpose
        });

      if (dbError) throw dbError;

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  // Survey creation
  const handleCreateSurvey = () => {
    console.log('Creating survey with project ID:', projectId);
    
    if (!name.trim()) {
      toast({
        title: "Survey Name Required",
        description: "Please provide a survey name.",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Project Required",
        description: "Please select a project before creating the survey.",
        variant: "destructive",
      });
      return;
    }

    const validQuestions = questions.filter(q => q.trim());
    if (validQuestions.length === 0) {
      toast({
        title: "Questions Required",
        description: "Please add at least one question.",
        variant: "destructive",
      });
      return;
    }

    const survey: SurveyData = {
      name: name.trim(),
      description: description.trim() || undefined,
      questions: validQuestions
    };

    console.log('Survey data created:', survey);
    setSurveyData(survey);
    setStep('personas');
  };

  // Persona selection with improved error handling
  const handlePersonasSelected = async (personas: string[]): Promise<boolean> => {
    console.log('Starting persona selection with:', personas);
    console.log('Current project ID:', projectId);
    
    if (!projectId) {
      const errorMsg = 'No project selected. Please go back and select a project.';
      console.error(errorMsg);
      toast({
        title: "Project Required",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    }

    setSelectedPersonas(personas);
    
    try {
      console.log('Calling createSession with project ID:', projectId);
      const success = await createSession(personas, projectId);
      
      if (!success) {
        console.error('createSession returned false');
        toast({
          title: "Session Creation Failed",
          description: "Failed to create research session. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Session created successfully, moving to execution step');
      setStep('execution');
      
      toast({
        title: "Survey Session Started",
        description: `Survey ready to run with ${personas.length} personas.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error in handlePersonasSelected:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Session Creation Error",
        description: `Failed to start survey session: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    }
  };

  if (step === 'personas') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Select Personas</h1>
          <p className="text-muted-foreground">
            Choose personas to participate in your survey: "{surveyData?.name}"
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {surveyData?.questions.length} questions
            </div>
            {projectDocuments.length > 0 && (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {projectDocuments.length} support documents
              </div>
            )}
          </div>
          {projectId && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md border border-green-200">
              <FileCheck className="w-4 h-4" />
              Project connected: {projectId}
            </div>
          )}
        </div>

        <PersonaLoader
          maxPersonas={10}
          onStartSession={handlePersonasSelected}
          isLoading={isLoading}
        />

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setStep('build')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Survey Builder
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'execution' && surveyData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <ResearchSurveyExecution
          surveyData={surveyData}
          selectedPersonas={selectedPersonas}
          sessionId={sessionId}
          projectId={projectId}
          sendMessage={sendMessage}
          sendToPersona={sendToPersona}
          onComplete={() => {
            setStep('build');
            setSurveyData(null);
            setSelectedPersonas([]);
            setName('');
            setDescription('');
            setQuestions(['']);
          }}
          onBack={() => setStep('personas')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Create Research Survey</h1>
        <p className="text-muted-foreground">
          Build a comprehensive survey with supporting materials for qualitative research
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Survey Name */}
          <div>
            <Label htmlFor="survey-name">Survey Name *</Label>
            <Input
              id="survey-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Feedback Survey"
              className="mt-1"
            />
          </div>

          {/* Project Selection */}
          <div>
            <Label>Project Selection *</Label>
            <div className="mt-1">
              {projectId ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <FileCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">Project connected: {projectId}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProjectId(null)}
                  >
                    Change Project
                  </Button>
                </div>
              ) : (
                <ProjectSelector
                  onProjectSelected={(id) => {
                    console.log('Project selected:', id);
                    setProjectId(id);
                  }}
                  showCreateOption={true}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="survey-description">Description (Optional)</Label>
            <Textarea
              id="survey-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the survey purpose and methodology"
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Survey Questions *</Label>
              <div className="flex gap-2">
                <Dialog open={showCSVDialog} onOpenChange={setShowCSVDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <FileUp className="w-4 h-4 mr-2" />
                      CSV Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Import Questions from CSV</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        value={csvContent}
                        onChange={(e) => {
                          setCsvContent(e.target.value);
                          parseCSVContent(e.target.value);
                        }}
                        placeholder="Paste CSV content here..."
                        rows={6}
                        className="font-mono text-sm"
                      />
                      {previewQuestions.length > 0 && (
                        <div className="space-y-2">
                          <Label>Preview ({previewQuestions.length} questions)</Label>
                          <div className="max-h-32 overflow-y-auto border rounded p-3 space-y-1">
                            {previewQuestions.slice(0, 3).map((question, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">Q{index + 1}:</span> {question}
                              </div>
                            ))}
                            {previewQuestions.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                ...and {previewQuestions.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowCSVDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCSVImport} disabled={previewQuestions.length === 0}>
                          Import Questions
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Choose Survey Template</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3">
                      <Button variant="outline" onClick={() => loadTemplate('product')} className="justify-start">
                        Product Feedback Survey
                      </Button>
                      <Button variant="outline" onClick={() => loadTemplate('message')} className="justify-start">
                        Message Testing Survey
                      </Button>
                      <Button variant="outline" onClick={() => loadTemplate('ux')} className="justify-start">
                        UX Testing Survey
                      </Button>
                      <Button variant="outline" onClick={() => loadTemplate('policy')} className="justify-start">
                        Policy Response Survey
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">
                      Question {index + 1}
                    </Label>
                    <Textarea
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      placeholder={`Enter question ${index + 1}`}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    disabled={questions.length === 1}
                    className="mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <Label>Supporting Materials</Label>
            
            {/* Image Upload for Visual Studies */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Image className="w-4 h-4" />
                Images for Visual Analysis
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach(file => {
                      handleFileUpload(file, 'Visual Analysis Material');
                    });
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={uploadingFiles || !projectId}
                  className="w-full"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Upload Images for Branding/Design Studies
                </Button>
              </div>
            </div>

            {/* URL Input for Web Design */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website URL for UX Analysis
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const url = e.currentTarget.value.trim();
                      // Create a simple text file with the URL
                      const blob = new Blob([`Website URL for Analysis: ${url}`], { type: 'text/plain' });
                      const file = new File([blob], `website-url-${Date.now()}.txt`, { type: 'text/plain' });
                      handleFileUpload(file, 'Website URL Analysis');
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="https://example.com"]') as HTMLInputElement;
                    const url = input?.value.trim();
                    if (url) {
                      const blob = new Blob([`Website URL for Analysis: ${url}`], { type: 'text/plain' });
                      const file = new File([blob], `website-url-${Date.now()}.txt`, { type: 'text/plain' });
                      handleFileUpload(file, 'Website URL Analysis');
                      input.value = '';
                    }
                  }}
                  disabled={!projectId}
                >
                  Add URL
                </Button>
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Supporting Documents
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach(file => {
                      const purpose = prompt('What is the purpose of this document? (e.g., Project Guidelines, Context, Requirements)') || 'Supporting Document';
                      handleFileUpload(file, purpose);
                    });
                  }}
                  className="hidden"
                  id="document-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('document-upload')?.click()}
                  disabled={uploadingFiles || !projectId}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Supporting Documents
                </Button>
              </div>
            </div>

            {projectDocuments.length > 0 && (
              <Alert>
                <FileCheck className="w-4 h-4" />
                <AlertDescription>
                  <strong>{projectDocuments.length} documents uploaded:</strong> These will be available to personas during the survey for context and reference.
                </AlertDescription>
              </Alert>
            )}

            {!projectId && (
              <Alert>
                <FileUp className="w-4 h-4" />
                <AlertDescription>
                  <strong>Select a project to upload supporting materials.</strong> Documents help provide context to personas during the survey.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Create Survey Button */}
          <div className="flex justify-end gap-2 pt-4">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button 
              onClick={handleCreateSurvey} 
              disabled={!name.trim() || questions.filter(q => q.trim()).length === 0 || !projectId}
            >
              Create Survey
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedSurveyInterface;
