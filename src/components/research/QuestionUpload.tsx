
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionUploadProps {
  questions: string[];
  onQuestionsChange: (questions: string[]) => void;
}

export const QuestionUpload: React.FC<QuestionUploadProps> = ({
  questions,
  onQuestionsChange
}) => {
  const [uploadMode, setUploadMode] = useState<'manual' | 'file'>('manual');

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
    onQuestionsChange([...questions, '']);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      onQuestionsChange(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, value: string) => {
    const updatedQuestions = questions.map((q, i) => i === index ? value : q);
    onQuestionsChange(updatedQuestions);
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
            
            {questions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    placeholder={`Question ${index + 1}...`}
                    rows={2}
                  />
                </div>
                {questions.length > 1 && (
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
        )}
      </CardContent>
    </Card>
  );
};
