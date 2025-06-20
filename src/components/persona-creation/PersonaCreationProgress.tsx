
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PersonaCreationProgress } from '@/services/persona/progressService';

interface PersonaCreationProgressProps {
  progress: PersonaCreationProgress;
}

const PersonaCreationProgressComponent: React.FC<PersonaCreationProgressProps> = ({ progress }) => {
  const getIcon = () => {
    if (progress.hasError) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    if (progress.isComplete) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex-1">
            <h3 className="font-medium">Creating Your Persona</h3>
            <p className="text-sm text-muted-foreground">{progress.message}</p>
          </div>
        </div>
        
        <Progress 
          value={progress.progress} 
          className={`h-2 ${progress.hasError ? 'bg-red-100' : ''}`}
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{progress.step}</span>
          <span>{progress.progress}%</span>
        </div>
        
        {progress.hasError && progress.errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{progress.errorMessage}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PersonaCreationProgressComponent;
