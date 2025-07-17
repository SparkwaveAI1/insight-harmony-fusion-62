
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, Upload, Play, Pause, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadKnowledgeBaseDocument } from '@/services/collections';
import { toast } from 'sonner';

interface SurveyData {
  name: string;
  description?: string;
  questions: string[];
}

interface SurveyExecutionProps {
  surveyData: SurveyData;
  selectedPersonas: string[];
  sessionId: string | null;
  projectId: string | null;
  sendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  sendToPersona: (personaId: string) => Promise<void>;
  onComplete: () => void;
  onBack: () => void;
}

export const ResearchSurveyExecution: React.FC<SurveyExecutionProps> = ({
  surveyData,
  selectedPersonas,
  sessionId,
  projectId,
  sendMessage,
  sendToPersona,
  onComplete,
  onBack
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, string[]>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedPersonas, setCompletedPersonas] = useState<Set<string>>(new Set());
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const totalQuestions = surveyData.questions.length;
  const totalPersonas = selectedPersonas.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  const handleFileUpload = async () => {
    if (!projectId || !uploadFile || !uploadTitle.trim()) {
      toast.error('Please provide a title and select a file');
      return;
    }

    try {
      const document = await uploadKnowledgeBaseDocument(
        projectId,
        uploadTitle.trim(),
        undefined,
        uploadFile
      );

      if (document) {
        toast.success('Document uploaded successfully');
        setShowUploadDialog(false);
        setUploadTitle('');
        setUploadFile(null);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  };

  const startSurvey = async () => {
    if (!sessionId || surveyData.questions.length === 0) {
      toast.error('Survey session not ready');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    
    try {
      // Send first question to all personas
      const firstQuestion = surveyData.questions[0];
      await sendMessage(`Survey Question ${currentQuestionIndex + 1}/${totalQuestions}: ${firstQuestion}`);
      
      // Give personas time to respond, then collect responses
      setTimeout(() => {
        collectPersonaResponses();
      }, 3000);
    } catch (error) {
      console.error('Error starting survey:', error);
      toast.error('Failed to start survey');
      setIsRunning(false);
    }
  };

  const collectPersonaResponses = async () => {
    if (isPaused) return;

    for (const personaId of selectedPersonas) {
      if (completedPersonas.has(personaId)) continue;
      
      try {
        await sendToPersona(personaId);
        
        // Update responses map
        setResponses(prev => {
          const newMap = new Map(prev);
          const personaResponses = newMap.get(personaId) || [];
          personaResponses.push(`Response to Q${currentQuestionIndex + 1}`);
          newMap.set(personaId, personaResponses);
          return newMap;
        });
        
        // Small delay between personas to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error getting response from persona ${personaId}:`, error);
      }
    }

    // Move to next question or complete
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      completeSurvey();
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      const nextQuestion = surveyData.questions[nextIndex];
      await sendMessage(`Survey Question ${nextIndex + 1}/${totalQuestions}: ${nextQuestion}`);
      
      setTimeout(() => {
        collectPersonaResponses();
      }, 3000);
    }
  };

  const pauseSurvey = () => {
    setIsPaused(true);
    toast.info('Survey paused');
  };

  const resumeSurvey = () => {
    setIsPaused(false);
    toast.info('Survey resumed');
    collectPersonaResponses();
  };

  const completeSurvey = () => {
    setIsRunning(false);
    toast.success('Survey completed successfully!');
    
    // Mark all personas as completed
    setCompletedPersonas(new Set(selectedPersonas));
  };

  const exportResults = () => {
    const results = {
      surveyName: surveyData.name,
      totalQuestions: totalQuestions,
      totalPersonas: totalPersonas,
      responses: Object.fromEntries(responses),
      completedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-results-${surveyData.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Survey: {surveyData.name}
            </CardTitle>
            <div className="flex gap-2">
              {projectId && (
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Supporting Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="upload-title">Document Title</Label>
                        <Input
                          id="upload-title"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          placeholder="e.g., Survey Requirements, Project Brief"
                        />
                      </div>
                      <div>
                        <Label htmlFor="upload-file">File</Label>
                        <Input
                          id="upload-file"
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          accept=".pdf,.doc,.docx,.txt,.md,.csv"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleFileUpload} disabled={!uploadTitle.trim() || !uploadFile}>
                          Upload
                        </Button>
                        <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{totalPersonas} personas • {totalQuestions} questions</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isRunning && currentQuestionIndex === 0 && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Ready to Start Survey</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Survey will be conducted with {totalPersonas} personas across {totalQuestions} questions.
                  Each persona will respond to all questions in sequence.
                </p>
                <Button onClick={startSurvey} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Start Survey
                </Button>
              </div>
            </div>
          )}

          {isRunning && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  Current Question ({currentQuestionIndex + 1}/{totalQuestions})
                </h3>
                <div className="flex gap-2">
                  {!isPaused ? (
                    <Button variant="outline" size="sm" onClick={pauseSurvey}>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={resumeSurvey}>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium text-sm mb-2">Question:</p>
                <p>{surveyData.questions[currentQuestionIndex]}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPersonas.map(personaId => (
                  <div key={personaId} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Persona {personaId.slice(-4)}</span>
                      <span className="text-xs text-muted-foreground">
                        {responses.get(personaId)?.length || 0}/{totalQuestions} responses
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {completedPersonas.has(personaId) ? 'Completed' : 'In Progress'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedPersonas.size === totalPersonas && totalPersonas > 0 && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium mb-2 text-green-800">Survey Complete!</h3>
                <p className="text-sm text-green-700 mb-4">
                  All {totalPersonas} personas have completed the {totalQuestions} question survey.
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={exportResults} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>
                  <Button onClick={onComplete}>
                    View Results
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
