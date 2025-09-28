import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, CreditCard } from 'lucide-react';
import { getStudyCostBreakdown, formatCurrency } from '@/utils/surveyBilling';

interface StudyCostDisplayProps {
  questionCount: number;
  personaCount: number;
  className?: string;
}

export const StudyCostDisplay: React.FC<StudyCostDisplayProps> = ({
  questionCount,
  personaCount,
  className = ''
}) => {
  const breakdown = getStudyCostBreakdown(questionCount, personaCount);

  if (questionCount === 0 || personaCount === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Study Cost
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Select questions and personas to see cost estimate
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Study Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Questions:</span>
            <div className="font-medium">{breakdown.questionCount}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Personas:</span>
            <div className="font-medium">{breakdown.personaCount}</div>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Rate per question:</span>
            <span className="font-medium">{formatCurrency(breakdown.costPerQuestion)}</span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total interactions:</span>
            <span className="font-medium">{breakdown.questionCount} × {breakdown.personaCount} = {breakdown.questionCount * breakdown.personaCount}</span>
          </div>
          
          <div className="flex items-center justify-between text-base font-semibold border-t pt-2">
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Total Cost:
            </span>
            <span className="text-primary">{formatCurrency(breakdown.totalCost)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Required Credits:
            </span>
            <span>{breakdown.requiredCredits} credits</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};