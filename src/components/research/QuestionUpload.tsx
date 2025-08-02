
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Plus, Trash2, Image, X } from 'lucide-react';
import { toast } from 'sonner';

export interface SurveyQuestion {
  text: string;
  image?: string; // base64 image data
  imageFile?: File; // for temporary storage during editing
}

interface QuestionUploadProps {
  questions: string[];
  onQuestionsChange: (questions: string[]) => void;
  surveyQuestions?: SurveyQuestion[];
  onSurveyQuestionsChange?: (questions: SurveyQuestion[]) => void;
}

export const QuestionUpload: React.FC<QuestionUploadProps> = ({
  questions,
  onQuestionsChange,
  surveyQuestions = [],
  onSurveyQuestionsChange
}) => {
  const [uploadMode, setUploadMode] = useState<'manual' | 'file'>('manual');
  
  // Initialize survey questions from text questions if not provided
  React.useEffect(() => {
    if (onSurveyQuestionsChange && surveyQuestions.length === 0 && questions.length > 0) {
      const initialSurveyQuestions = questions.map(text => ({ text }));
      onSurveyQuestionsChange(initialSurveyQuestions);
    }
  }, [questions, surveyQuestions, onSurveyQuestionsChange]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV or TXT file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseFileContent(content);
    };
    reader.readAsText(file);
  };

  const parseFileContent = (content: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const parsedQuestions: string[] = [];

      lines.forEach(line => {
        // Handle CSV format (comma-separated)
        if (line.includes(',')) {
          const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
          parsedQuestions.push(...parts.filter(part => part.length > 0));
        } else {
          // Handle simple line-by-line format
          const trimmed = line.trim().replace(/"/g, '');
          if (trimmed) parsedQuestions.push(trimmed);
        }
      });

      if (parsedQuestions.length === 0) {
        toast.error('No valid questions found in file');
        return;
      }

      onQuestionsChange(parsedQuestions);
      toast.success(`Imported ${parsedQuestions.length} questions`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file content');
    }
  };

  const addQuestion = () => {
    const newQuestions = [...questions, ''];
    onQuestionsChange(newQuestions);
    
    if (onSurveyQuestionsChange) {
      const newSurveyQuestions = [...surveyQuestions, { text: '' }];
      onSurveyQuestionsChange(newSurveyQuestions);
    }
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      onQuestionsChange(newQuestions);
      
      if (onSurveyQuestionsChange) {
        const newSurveyQuestions = surveyQuestions.filter((_, i) => i !== index);
        onSurveyQuestionsChange(newSurveyQuestions);
      }
    }
  };

  const updateQuestion = (index: number, value: string) => {
    const updatedQuestions = questions.map((q, i) => i === index ? value : q);
    onQuestionsChange(updatedQuestions);
    
    if (onSurveyQuestionsChange) {
      const updatedSurveyQuestions = surveyQuestions.map((q, i) => 
        i === index ? { ...q, text: value } : q
      );
      onSurveyQuestionsChange(updatedSurveyQuestions);
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!onSurveyQuestionsChange) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file must be less than 10MB');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const base64 = e.target?.result as string;
        const updatedSurveyQuestions = surveyQuestions.map((q, i) => 
          i === index ? { ...q, image: base64, imageFile: file } : q
        );
        onSurveyQuestionsChange(updatedSurveyQuestions);
        toast.success(`Image "${file.name}" attached to question ${index + 1}`);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    if (!onSurveyQuestionsChange) return;
    
    const updatedSurveyQuestions = surveyQuestions.map((q, i) => 
      i === index ? { text: q.text } : q
    );
    onSurveyQuestionsChange(updatedSurveyQuestions);
    toast.success(`Image removed from question ${index + 1}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Survey Questions
        </CardTitle>
        
        <div className="flex gap-2">
          <Button
            variant={uploadMode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('manual')}
          >
            Manual Entry
          </Button>
          <Button
            variant={uploadMode === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('file')}
          >
            Upload File
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {uploadMode === 'file' ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Upload a CSV or TXT file with your questions
                </p>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="question-file-upload"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('question-file-upload')?.click()}
                >
                  Choose File
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-2">File Format Guidelines:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• One question per line, or comma-separated questions</li>
                <li>• CSV and TXT formats supported</li>
                <li>• Questions should be clear and specific</li>
                <li>• Example: "What do you think about this product?"</li>
              </ul>
            </div>

            {questions.length > 0 && (
              <div className="space-y-2">
                <Label>Imported Questions ({questions.length})</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-2">
                  {questions.slice(0, 5).map((question, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-muted-foreground">Q{index + 1}:</span> {question}
                    </div>
                  ))}
                  {questions.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ...and {questions.length - 5} more questions
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
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
            
            {questions.map((question, index) => {
              const surveyQuestion = surveyQuestions[index];
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Textarea
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        placeholder={`Question ${index + 1}...`}
                        rows={2}
                      />
                    </div>
                    
                    {/* Image upload button */}
                    {onSurveyQuestionsChange && (
                      <div className="flex flex-col gap-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(index, file);
                          }}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <Button
                          type="button"
                          variant={surveyQuestion?.image ? "default" : "outline"}
                          size="sm"
                          onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                          title="Attach image to question"
                          className={surveyQuestion?.image ? "bg-green-100 border-green-500 text-green-700 hover:bg-green-200" : ""}
                        >
                          <Image className="w-4 h-4" />
                          {surveyQuestion?.image ? "✓" : ""}
                        </Button>
                        
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            title="Remove question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {!onSurveyQuestionsChange && questions.length > 1 && (
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
                  
                   {/* Show attached image if present */}
                   {surveyQuestion?.image && (
                     <div className="relative w-40 h-24 border-2 border-green-200 rounded-lg overflow-hidden bg-green-50">
                       <img 
                         src={surveyQuestion.image} 
                         alt={`Question ${index + 1} attachment`}
                         className="w-full h-full object-cover"
                       />
                       <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                         Q{index + 1}
                       </div>
                       <Button
                         type="button"
                         variant="destructive"
                         size="sm"
                         className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 hover:opacity-100"
                         onClick={() => removeImage(index)}
                         title="Remove image"
                       >
                         <X className="w-3 h-3" />
                       </Button>
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
