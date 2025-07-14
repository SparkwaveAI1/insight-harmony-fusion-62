import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CSVImportDialogProps {
  open: boolean;
  onClose: () => void;
  personaId: string;
}

export const CSVImportDialog: React.FC<CSVImportDialogProps> = ({ 
  open, 
  onClose, 
  personaId 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  };

  const parseCsvQuestions = (csv: string): string[] => {
    const lines = csv.split('\n').filter(line => line.trim());
    const questions: string[] = [];

    lines.forEach(line => {
      // Handle both comma-separated and line-by-line formats
      if (line.includes(',')) {
        const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
        questions.push(...parts.filter(part => part));
      } else {
        const trimmed = line.trim().replace(/"/g, '');
        if (trimmed) questions.push(trimmed);
      }
    });

    return questions.filter(q => q.length > 0);
  };

  const handleImport = async () => {
    if (!name.trim()) {
      toast.error('Survey name is required');
      return;
    }

    if (!csvContent.trim()) {
      toast.error('CSV content is required');
      return;
    }

    setIsImporting(true);
    try {
      const questions = parseCsvQuestions(csvContent);
      
      if (questions.length === 0) {
        toast.error('No valid questions found in CSV');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('surveys')
        .insert([{
          name: name.trim(),
          description: description.trim(),
          questions,
          user_id: user.id
        }]);

      if (error) throw error;

      toast.success(`Survey created with ${questions.length} questions`);
      setName('');
      setDescription('');
      setCsvContent('');
      onClose();
    } catch (error) {
      console.error('Error importing survey:', error);
      toast.error('Failed to import survey');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Survey from CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="import-name">Survey Name</Label>
            <Input
              id="import-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter survey name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-description">Description (Optional)</Label>
            <Textarea
              id="import-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter survey description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
            />
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with questions. Each question can be on a new line or comma-separated.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-content">CSV Content</Label>
            <Textarea
              id="csv-content"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste your questions here, one per line or comma-separated"
              rows={10}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              {isImporting ? 'Importing...' : 'Import Survey'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};