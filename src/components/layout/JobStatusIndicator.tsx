import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useBackgroundPersonaJobs } from '@/hooks/useBackgroundPersonaJobs';
import { JobProgressNotification } from '@/components/persona-creation/JobProgressNotification';

export const JobStatusIndicator: React.FC = () => {
  const { activeJobs, completedJobs, hasActiveJobs, hasCompletedJobs, totalProgress, removeJob } = useBackgroundPersonaJobs();
  const [isOpen, setIsOpen] = useState(false);

  if (!hasActiveJobs && !hasCompletedJobs) {
    return null;
  }

  const getIndicatorIcon = () => {
    if (hasActiveJobs) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    const hasFailedJobs = completedJobs.some(job => job.status === 'failed');
    if (hasFailedJobs) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getBadgeVariant = () => {
    if (hasActiveJobs) return 'default';
    const hasFailedJobs = completedJobs.some(job => job.status === 'failed');
    if (hasFailedJobs) return 'secondary';
    return 'default';
  };

  const totalJobs = activeJobs.length + completedJobs.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {getIndicatorIcon()}
          <Badge 
            variant={getBadgeVariant()}
            className="ml-2 text-xs"
          >
            {totalJobs}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h3 className="font-medium">Persona Creation Jobs</h3>
          <p className="text-sm text-muted-foreground">
            {hasActiveJobs ? `${activeJobs.length} active, ` : ''}
            {completedJobs.length} recent
          </p>
        </div>
        <ScrollArea className="max-h-96">
          <div className="p-3 space-y-3">
            {activeJobs.map(job => (
              <JobProgressNotification
                key={job.id}
                job={job}
                onRemove={removeJob}
              />
            ))}
            {completedJobs.slice(0, 5).map(job => (
              <JobProgressNotification
                key={job.id}
                job={job}
                onRemove={removeJob}
              />
            ))}
            {completedJobs.length === 0 && activeJobs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent persona creation jobs
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};