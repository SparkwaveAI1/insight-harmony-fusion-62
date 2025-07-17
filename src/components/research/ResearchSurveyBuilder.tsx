
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FileText, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface SurveyData {
  name: string;
  description?: string;
  questions: string[];
}

interface ResearchSurveyBuilderProps {
  onSurveyCreated: (survey: SurveyData) => void;
}

export const ResearchSurveyBuilder: React.FC<ResearchSurveyBuilderProps> = ({ onSurveyCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please provide a survey name');
      return;
    }

    const validQuestions = questions.filter(q => q.trim());
    if (validQuestions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    const survey: SurveyData = {
      name: name.trim(),
      description: description.trim() || undefined,
      questions: validQuestions
    };

    onSurveyCreated(survey);
  };

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
    setShowTemplateDialog(false);
    toast.success(`${template_data.name} template loaded`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Create Research Survey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="survey-name">Survey Name *</Label>
              <Input
                id="survey-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Product Feedback Survey"
                required
              />
            </div>

            <div>
              <Label htmlFor="survey-description">Description</Label>
              <Textarea
                id="survey-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the survey purpose and methodology"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Survey Questions</Label>
              <div className="flex gap-2">
                <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
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
                        <FileText className="w-4 h-4 mr-2" />
                        Product Feedback Survey
                      </Button>
                      <Button variant="outline" onClick={() => loadTemplate('message')} className="justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Message Testing Survey
                      </Button>
                      <Button variant="outline" onClick={() => loadTemplate('ux')} className="justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        UX Testing Survey
                      </Button>
                      <Button variant="outline" onClick={() => loadTemplate('policy')} className="justify-start">
                        <FileText className="w-4 h-4 mr-2" />
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
                    <Label htmlFor={`question-${index}`} className="text-sm text-muted-foreground">
                      Question {index + 1}
                    </Label>
                    <Textarea
                      id={`question-${index}`}
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

          <Alert>
            <FileText className="w-4 h-4" />
            <AlertDescription>
              <strong>Survey Tips:</strong> Questions will be asked sequentially to all selected personas. 
              Each persona will respond based on their traits, knowledge base documents, and conversation context.
              Upload supporting documents after creating the survey to provide additional context.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={!name.trim() || questions.filter(q => q.trim()).length === 0}>
              Create Survey
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
