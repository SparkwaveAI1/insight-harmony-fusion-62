import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, X, Eye } from 'lucide-react';
import { PersonaCreationJob } from '@/services/persona/backgroundJobService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface JobProgressNotificationProps {
  job: PersonaCreationJob;
  onRemove: (jobId: string) => void;
  onViewPersona?: (personaId: string) => void;
}

export const JobProgressNotification: React.FC<JobProgressNotificationProps> = ({
  job,
  onRemove,
  onViewPersona
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const getIcon = () => {
    if (job.status === 'failed') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (job.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
  };

  const getStatusColor = () => {
    if (job.status === 'failed') return 'border-red-200 bg-red-50';
    if (job.status === 'completed') return 'border-green-200 bg-green-50';
    return 'border-blue-200 bg-blue-50';
  };

  const handleViewPersona = () => {
    if (job.personaId) {
      navigate(`/persona-detail/${job.personaId}`);
      onRemove(job.id);
    }
  };

  const handleRemove = () => {
    onRemove(job.id);
    if (job.status === 'completed') {
      toast({
        title: "Job removed",
        description: "Persona creation notification dismissed",
      });
    }
  };

  return (
    <Card className={`p-3 ${getStatusColor()} border transition-all duration-200`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <div className="flex-1">
              <p className="font-medium text-sm">
                {job.status === 'completed' ? 'Persona Ready!' : 'Creating Persona'}
              </p>
              <p className="text-xs text-muted-foreground">{job.message}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {job.personaName && (
          <p className="text-sm font-medium text-foreground">{job.personaName}</p>
        )}

        {job.status !== 'completed' && job.status !== 'failed' && (
          <Progress value={job.progress} className="h-1" />
        )}

        {job.status === 'completed' && job.personaId && (
          <Button
            variant="default"
            size="sm"
            onClick={handleViewPersona}
            className="w-full h-7"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Persona
          </Button>
        )}

        {job.status === 'failed' && job.error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            {job.error}
          </div>
        )}
      </div>
    </Card>
  );
};