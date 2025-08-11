
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Plus, Trash2, Image, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { extractTextFromFile } from '@/services/collections/textExtractionService';

export interface SurveyQuestion {
  text: string;
  images?: string[]; // array of base64 image data
  imageFiles?: File[]; // for temporary storage during editing
  // Keep legacy fields for backward compatibility
  image?: string;
  imageFile?: File;
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
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Initialize survey questions from text questions if not provided
  React.useEffect(() => {
    if (onSurveyQuestionsChange && surveyQuestions.length === 0 && questions.length > 0) {
      const initialSurveyQuestions = questions.map(text => ({ text }));
      onSurveyQuestionsChange(initialSurveyQuestions);
    }
  }, [questions, surveyQuestions, onSurveyQuestionsChange]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    
    try {
      const extractedText = await extractTextFromFile(file);
      
      if (!extractedText) {
        toast.error('Could not extract text from this file type');
        return;
      }
      
      parseFileContent(extractedText);
    } catch (error) {
      console.error('Error extracting text from file:', error);
      toast.error('Failed to extract text from file');
    } finally {
      setIsExtracting(false);
    }
  };

  const parseFileContent = (content: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const parsedQuestions: string[] = [];

      lines.forEach(line => {
        const trimmed = line.trim().replace(/"/g, '');
        if (trimmed) {
          // Handle numbered lists (1. Question, 2. Question, etc.)
          const numberedMatch = trimmed.match(/^\d+[\.\)]\s*(.+)/);
          if (numberedMatch) {
            parsedQuestions.push(numberedMatch[1].trim());
            return;
          }
          
          // Handle bullet points (• Question, - Question, * Question)
          const bulletMatch = trimmed.match(/^[•\-\*]\s*(.+)/);
          if (bulletMatch) {
            parsedQuestions.push(bulletMatch[1].trim());
            return;
          }
          
          // Handle CSV format (comma-separated)
          if (trimmed.includes(',')) {
            const parts = trimmed.split(',').map(part => part.trim().replace(/"/g, ''));
            parsedQuestions.push(...parts.filter(part => part.length > 10)); // Only add meaningful questions
          } else {
            // Handle simple line-by-line format
            if (trimmed.length > 10) { // Only add meaningful questions
              parsedQuestions.push(trimmed);
            }
          }
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

  const handleImageUpload = async (index: number, files: FileList) => {
    if (!onSurveyQuestionsChange) return;
    
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    // Validate each file
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} (invalid type)`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (too large)`);
        return;
      }
      validFiles.push(file);
    });
    
    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(', ')}`);
    }
    
    if (validFiles.length === 0) return;
    
    // Convert files to base64
    const base64Promises = validFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsDataURL(file);
      });
    });
    
    try {
      const base64Images = await Promise.all(base64Promises);
      
      const updatedSurveyQuestions = surveyQuestions.map((q, i) => {
        if (i === index) {
          const existingImages = q.images || [];
          const existingFiles = q.imageFiles || [];
          return { 
            ...q, 
            images: [...existingImages, ...base64Images],
            imageFiles: [...existingFiles, ...validFiles]
          };
        }
        return q;
      });
      
      onSurveyQuestionsChange(updatedSurveyQuestions);
      toast.success(`${validFiles.length} image(s) attached to question ${index + 1}`);
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process some images');
    }
  };

  const removeImage = (index: number, imageIndex?: number) => {
    if (!onSurveyQuestionsChange) return;
    
    const updatedSurveyQuestions = surveyQuestions.map((q, i) => {
      if (i === index) {
        if (typeof imageIndex === 'number') {
          // Remove specific image
          const newImages = [...(q.images || [])];
          const newFiles = [...(q.imageFiles || [])];
          newImages.splice(imageIndex, 1);
          newFiles.splice(imageIndex, 1);
          return { ...q, images: newImages, imageFiles: newFiles };
        } else {
          // Remove all images (legacy support)
          return { text: q.text };
        }
      }
      return q;
    });
    
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
              {isExtracting ? (
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground">Extracting text from file...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Upload a file with your questions
                    </p>
                    <input
                      type="file"
                      accept="text/csv,text/plain,application/pdf,image/*,.csv,.txt,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="question-file-upload"
                      disabled={isExtracting}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('question-file-upload')?.click()}
                      disabled={isExtracting}
                    >
                      Choose File
                    </Button>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-2">Supported File Types:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>PDF</strong> - Automatically extracts text and parses questions</li>
                <li>• <strong>Images</strong> - Uses OCR to extract text from screenshots or photos</li>
                <li>• <strong>CSV/TXT</strong> - One question per line or comma-separated</li>
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
                          multiple
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) handleImageUpload(index, files);
                          }}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <Button
                          type="button"
                          variant={(surveyQuestion?.images?.length || surveyQuestion?.image) ? "default" : "outline"}
                          size="sm"
                          onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                          title="Attach images to question (multiple allowed)"
                          className={(surveyQuestion?.images?.length || surveyQuestion?.image) ? "bg-green-100 border-green-500 text-green-700 hover:bg-green-200" : ""}
                        >
                          <Image className="w-4 h-4" />
                          {(surveyQuestion?.images?.length || (surveyQuestion?.image ? 1 : 0)) > 0 && (
                            <span className="ml-1 text-xs">
                              {surveyQuestion?.images?.length || 1}
                            </span>
                          )}
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
                  
                   {/* Show attached images if present */}
                   {((surveyQuestion?.images?.length || 0) > 0 || surveyQuestion?.image) && (
                     <div className="flex flex-wrap gap-2">
                       {/* Show new multi-image format */}
                       {surveyQuestion?.images?.map((image, imageIndex) => (
                         <div key={imageIndex} className="relative w-20 h-16 border-2 border-green-200 rounded-lg overflow-hidden bg-green-50">
                           <img 
                             src={image} 
                             alt={`Question ${index + 1} attachment ${imageIndex + 1}`}
                             className="w-full h-full object-cover"
                           />
                           <div className="absolute top-0.5 left-0.5 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                             {imageIndex + 1}
                           </div>
                           <Button
                             type="button"
                             variant="destructive"
                             size="sm"
                             className="absolute top-0.5 right-0.5 h-4 w-4 p-0 opacity-80 hover:opacity-100"
                             onClick={() => removeImage(index, imageIndex)}
                             title="Remove image"
                           >
                             <X className="w-2 h-2" />
                           </Button>
                         </div>
                       ))}
                       
                       {/* Show legacy single image format */}
                       {surveyQuestion?.image && !surveyQuestion?.images?.length && (
                         <div className="relative w-20 h-16 border-2 border-green-200 rounded-lg overflow-hidden bg-green-50">
                           <img 
                             src={surveyQuestion.image} 
                             alt={`Question ${index + 1} attachment`}
                             className="w-full h-full object-cover"
                           />
                           <div className="absolute top-0.5 left-0.5 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                             1
                           </div>
                           <Button
                             type="button"
                             variant="destructive"
                             size="sm"
                             className="absolute top-0.5 right-0.5 h-4 w-4 p-0 opacity-80 hover:opacity-100"
                             onClick={() => removeImage(index)}
                             title="Remove image"
                           >
                             <X className="w-2 h-2" />
                           </Button>
                         </div>
                       )}
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
