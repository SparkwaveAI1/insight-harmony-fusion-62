import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Survey {
  id?: string;
  name: string;
  description: string;
  questions: string[];
}

interface SurveyBuilderProps {
  personaId: string;
  survey?: Survey | null;
  onSave: () => void;
  onCancel: () => void;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ 
  personaId, 
  survey, 
  onSave, 
  onCancel 
}) => {
  const [name, setName] = useState(survey?.name || '');
  const [description, setDescription] = useState(survey?.description || '');
  const [questions, setQuestions] = useState<string[]>(survey?.questions || ['']);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Survey name is required');
      return;
    }

    const validQuestions = questions.filter(q => q.trim());
    if (validQuestions.length === 0) {
      toast.error('At least one question is required');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const surveyData = {
        name: name.trim(),
        description: description.trim(),
        questions: validQuestions,
        user_id: user.id
      };

      if (survey?.id) {
        const { error } = await supabase
          .from('surveys')
          .update(surveyData)
          .eq('id', survey.id);
        
        if (error) throw error;
        toast.success('Survey updated successfully');
      } else {
        const { error } = await supabase
          .from('surveys')
          .insert([surveyData]);
        
        if (error) throw error;
        toast.success('Survey created successfully');
      }

      onSave();
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error('Failed to save survey');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{survey ? 'Edit Survey' : 'Create New Survey'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Survey Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter survey name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter survey description"
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Questions</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuestion}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Question
            </Button>
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={question}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                  rows={2}
                  className="flex-1"
                />
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="px-3"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Survey'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};