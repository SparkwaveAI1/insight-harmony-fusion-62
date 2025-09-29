import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResearchCSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (questions: string[], surveyName: string) => void;
}

export const ResearchCSVImport: React.FC<ResearchCSVImportProps> = ({ 
  open, 
  onOpenChange, 
  onImport 
}) => {
  const [name, setName] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      parseCSVContent(content);
      
      // Auto-generate name from filename if not set
      if (!name) {
        const fileName = file.name.replace('.csv', '').replace(/[_-]/g, ' ');
        setName(fileName);
      }
    };
    reader.readAsText(file);
  };

  const parseCSVContent = (content: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        setPreviewQuestions([]);
        return;
      }

      // Try to detect if first row is header
      const firstLine = lines[0];
      const isHeader = firstLine.toLowerCase().includes('question') || 
                      firstLine.toLowerCase().includes('text') ||
                      !firstLine.includes(',');
      
      const dataLines = isHeader ? lines.slice(1) : lines;
      
      // Extract questions (assume first column contains questions)
      const questions = dataLines
        .map(line => {
          // Simple CSV parsing - split by comma and take first column
          const firstColumn = line.split(',')[0];
          // Remove quotes if present
          return firstColumn.replace(/^["']|["']$/g, '').trim();
        })
        .filter(q => q.length > 0)
        .slice(0, 50); // Limit to 50 questions

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

  const handleTextareaChange = (value: string) => {
    setCsvContent(value);
    parseCSVContent(value);
  };

  const handleImport = () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Survey name is required.",
        variant: "destructive",
      });
      return;
    }

    if (previewQuestions.length === 0) {
      toast({
        title: "Validation Error",
        description: "No valid questions found in CSV.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      onImport(previewQuestions, name.trim());
      
      // Reset form
      setName('');
      setCsvContent('');
      setPreviewQuestions([]);
      
      // Close dialog
      onOpenChange(false);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${previewQuestions.length} questions.`,
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: "Import Error",
        description: "Failed to import questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setCsvContent('');
    setPreviewQuestions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Questions from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Survey Name */}
          <div>
            <Label htmlFor="survey-name">Survey Name*</Label>
            <Input
              id="survey-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter survey name..."
              className="mt-1"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload CSV File</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Choose a CSV file or paste content below
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('csv-upload')?.click()}
                >
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {/* Manual Text Input */}
          <div className="space-y-2">
            <Label htmlFor="csv-content">Or Paste CSV Content</Label>
            <Textarea
              id="csv-content"
              value={csvContent}
              onChange={(e) => handleTextareaChange(e.target.value)}
              placeholder="Paste your CSV content here..."
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Format: One question per line. First column should contain questions.
            </p>
          </div>

          {/* Preview */}
          {previewQuestions.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({previewQuestions.length} questions found)</Label>
              <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-2">
                {previewQuestions.slice(0, 5).map((question, index) => {
                  const questionText = typeof question === 'string' ? question : (question as any).text;
                  return (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-muted-foreground">Q{index + 1}:</span> {questionText}
                    </div>
                  );
                })}
                {previewQuestions.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    ...and {previewQuestions.length - 5} more questions
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Format Guidelines */}
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">CSV Format Guidelines:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Questions should be in the first column</li>
              <li>• One question per row</li>
              <li>• Headers are optional (will be auto-detected)</li>
              <li>• Maximum 50 questions per import</li>
              <li>• Questions should be clear and conversational</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || !name.trim() || previewQuestions.length === 0}
            >
              {isImporting ? 'Importing...' : `Import ${previewQuestions.length} Questions`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};