
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Target, FileText, BarChart, Users, Lightbulb, TrendingUp } from 'lucide-react';

export interface OutputGoalsData {
  primary_goals: string[];
  deliverables: string[];
  custom_deliverable?: string;
  project_id?: string | null;
}

interface DefineOutputGoalsProps {
  onGoalsDefined: (goals: OutputGoalsData) => void;
  hideProjectSelection?: boolean;
}

export const DefineOutputGoals: React.FC<DefineOutputGoalsProps> = ({ 
  onGoalsDefined, 
  hideProjectSelection = false 
}) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [customDeliverable, setCustomDeliverable] = useState('');

  const primaryGoals = [
    { id: 'user_feedback', label: 'Collect User Feedback', icon: <Users className="h-4 w-4" /> },
    { id: 'market_insights', label: 'Generate Market Insights', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'product_validation', label: 'Validate Product Concepts', icon: <Target className="h-4 w-4" /> },
    { id: 'competitive_analysis', label: 'Competitive Analysis', icon: <BarChart className="h-4 w-4" /> },
    { id: 'feature_prioritization', label: 'Feature Prioritization', icon: <Lightbulb className="h-4 w-4" /> }
  ];

  const deliverableOptions = [
    { id: 'executive_summary', label: 'Executive Summary' },
    { id: 'detailed_report', label: 'Detailed Research Report' },
    { id: 'persona_insights', label: 'Persona Insights & Quotes' },
    { id: 'recommendations', label: 'Strategic Recommendations' },
    { id: 'data_export', label: 'Raw Data Export' },
    { id: 'presentation', label: 'Presentation Slides' }
  ];

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleDeliverableToggle = (deliverableId: string) => {
    setSelectedDeliverables(prev => 
      prev.includes(deliverableId) 
        ? prev.filter(id => id !== deliverableId)
        : [...prev, deliverableId]
    );
  };

  const handleSubmit = () => {
    if (selectedGoals.length === 0) {
      return;
    }

    const finalDeliverables = [...selectedDeliverables];
    if (customDeliverable.trim()) {
      finalDeliverables.push(customDeliverable.trim());
    }

    const outputGoals: OutputGoalsData = {
      primary_goals: selectedGoals,
      deliverables: finalDeliverables,
      custom_deliverable: customDeliverable.trim() || undefined
    };

    onGoalsDefined(outputGoals);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Define Output Goals</h2>
        <p className="text-muted-foreground">
          What do you want to achieve and what deliverables do you need?
        </p>
      </div>

      {/* Primary Goals */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Primary Research Goals</h3>
          <p className="text-sm text-muted-foreground">Select your main research objectives</p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {primaryGoals.map((goal) => (
            <div
              key={goal.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedGoals.includes(goal.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedGoals.includes(goal.id)}
                  onChange={() => {}} // Handled by parent click
                />
                <div className="flex items-center gap-2 flex-1">
                  {goal.icon}
                  <span className="font-medium">{goal.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Deliverables */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Research Deliverables</h3>
          <p className="text-sm text-muted-foreground">What outputs do you need from this study?</p>
        </div>

        <div className="space-y-3 mb-4">
          {deliverableOptions.map((deliverable) => (
            <div key={deliverable.id} className="flex items-center space-x-3">
              <Checkbox
                id={deliverable.id}
                checked={selectedDeliverables.includes(deliverable.id)}
                onCheckedChange={() => handleDeliverableToggle(deliverable.id)}
              />
              <Label htmlFor={deliverable.id} className="flex-1">
                {deliverable.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-deliverable">Custom Deliverable (Optional)</Label>
          <Textarea
            id="custom-deliverable"
            placeholder="Describe any specific deliverable you need..."
            value={customDeliverable}
            onChange={(e) => setCustomDeliverable(e.target.value)}
            rows={2}
          />
        </div>
      </Card>

      {/* Summary */}
      {selectedGoals.length > 0 && (
        <Card className="p-4 bg-muted/30">
          <h4 className="font-medium mb-2">Study Summary</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Goals: </span>
              <span>{selectedGoals.length} selected</span>
            </div>
            <div>
              <span className="text-muted-foreground">Deliverables: </span>
              <span>{selectedDeliverables.length + (customDeliverable.trim() ? 1 : 0)} items</span>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={selectedGoals.length === 0}
          size="lg"
          className="px-8"
        >
          <FileText className="h-4 w-4 mr-2" />
          Continue to Review
        </Button>
      </div>
    </div>
  );
};
