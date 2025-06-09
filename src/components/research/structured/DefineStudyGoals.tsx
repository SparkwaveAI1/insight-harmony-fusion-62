
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, HelpCircle, Check, Edit } from 'lucide-react';
import { StudyGoalsAssistant } from './StudyGoalsAssistant';

export interface StudyGoal {
  objective: string;
  goal_type: 'product_feedback' | 'message_test' | 'incentive_modeling' | 'scenario_analysis' | 'loyalty_segmentation' | 'churn_diagnosis' | 'feature_validation';
  tags: string[];
  output_targets?: string[];
}

interface DefineStudyGoalsProps {
  onGoalDefined: (goal: StudyGoal) => void;
}

export const DefineStudyGoals: React.FC<DefineStudyGoalsProps> = ({ onGoalDefined }) => {
  const [manualGoal, setManualGoal] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [aiGeneratedGoal, setAiGeneratedGoal] = useState<StudyGoal | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleManualSubmit = () => {
    if (!manualGoal.trim()) return;
    
    // For manual input, we create a basic goal structure
    const goal: StudyGoal = {
      objective: manualGoal.trim(),
      goal_type: 'product_feedback', // Default type
      tags: [],
      output_targets: ['general_feedback']
    };
    
    onGoalDefined(goal);
  };

  const handleAssistantGoal = (goal: StudyGoal) => {
    setAiGeneratedGoal(goal);
    setShowPreview(true);
    setShowAssistant(false);
  };

  const handleAcceptAiGoal = () => {
    if (aiGeneratedGoal) {
      onGoalDefined(aiGeneratedGoal);
    }
  };

  const getGoalTypeLabel = (type: string) => {
    const labels = {
      product_feedback: 'Product Feedback',
      message_test: 'Message Testing',
      incentive_modeling: 'Incentive Modeling',
      scenario_analysis: 'Scenario Analysis',
      loyalty_segmentation: 'Loyalty Segmentation',
      churn_diagnosis: 'Churn Diagnosis',
      feature_validation: 'Feature Validation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Define Study Goals</h2>
        <p className="text-muted-foreground">
          What do you want to learn from your research study?
        </p>
      </div>

      {/* Option A: Manual Input */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Option A: Just tell us your goal</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Write in your own words. We'll help structure it after.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="manual-goal">Research Goal</Label>
            <Textarea
              id="manual-goal"
              placeholder="I want to understand why new users don't complete the onboarding flow"
              value={manualGoal}
              onChange={(e) => setManualGoal(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualGoal.trim()}
              className="flex-1"
            >
              Continue with this goal
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAssistant(true)}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Help me craft a goal
            </Button>
          </div>
        </div>
      </Card>

      {/* Option B: AI Assistant */}
      <Card className="p-6 bg-muted/30">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Option B: Help me define my goal</h3>
          <p className="text-muted-foreground">
            Use our AI assistant to structure your research objectives step-by-step
          </p>
          <Button
            variant="outline"
            onClick={() => setShowAssistant(true)}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Launch Goal Assistant
          </Button>
        </div>
      </Card>

      {/* AI Assistant Modal */}
      <Dialog open={showAssistant} onOpenChange={setShowAssistant}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Study Goals Assistant
            </DialogTitle>
          </DialogHeader>
          <StudyGoalsAssistant onGoalGenerated={handleAssistantGoal} />
        </DialogContent>
      </Dialog>

      {/* AI Generated Goal Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Your Study Goal</DialogTitle>
          </DialogHeader>
          
          {aiGeneratedGoal && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Objective</Label>
                <p className="mt-1 text-sm">{aiGeneratedGoal.objective}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Goal Type</Label>
                <Badge variant="secondary" className="mt-1">
                  {getGoalTypeLabel(aiGeneratedGoal.goal_type)}
                </Badge>
              </div>
              
              {aiGeneratedGoal.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiGeneratedGoal.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAcceptAiGoal} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    setShowAssistant(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
