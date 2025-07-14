import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SurveyData {
  name: string;
  description?: string;
  questions: string[];
}

interface ResearchSurveyBuilderProps {
  onSurveyCreated: (survey: SurveyData) => void;
}

export const ResearchSurveyBuilder: React.FC<ResearchSurveyBuilderProps> = ({ 
  onSurveyCreated
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const addQuestion = () => {
    if (questions.length < 50) {
      setQuestions([...questions, '']);
    }
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleCreateSurvey = () => {
    // Validate form
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Survey name is required",
        variant: "destructive",
      });
      return;
    }

    const validQuestions = questions.filter(q => q.trim());
    if (validQuestions.length === 0) {
      toast({
        title: "Validation Error", 
        description: "At least one question is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const surveyData: SurveyData = {
        name: name.trim(),
        description: description.trim() || undefined,
        questions: validQuestions
      };

      onSurveyCreated(surveyData);
    } catch (error) {
      console.error('Error creating survey:', error);
      toast({
        title: "Error",
        description: "Failed to create survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="w-5 h-5" />
          Create Survey Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Survey Details */}
        <div className="space-y-4">
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
          
          <div>
            <Label htmlFor="survey-description">Description (Optional)</Label>
            <Textarea
              id="survey-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this survey..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Questions ({questions.filter(q => q.trim()).length}/50)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuestion}
              disabled={questions.length >= 50}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  disabled={questions.length === 1}
                  className="self-start mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Tips for effective survey questions:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Use open-ended questions for conversational responses</li>
              <li>Be specific and clear in your wording</li>
              <li>Avoid leading or biased questions</li>
              <li>Consider follow-up questions for deeper insights</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button
            onClick={handleCreateSurvey}
            disabled={isCreating || !name.trim() || questions.filter(q => q.trim()).length === 0}
            size="lg"
          >
            {isCreating ? 'Creating...' : `Create Survey with ${questions.filter(q => q.trim()).length} Questions`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};