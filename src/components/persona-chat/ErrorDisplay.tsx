
import React from 'react';
import Card from '@/components/ui-custom/Card';

interface ErrorDisplayProps {
  personaId: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ personaId }) => {
  return (
    <Card className="p-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2 text-red-500">Failed to load persona</h3>
        <p className="mb-4">Could not load persona with ID: {personaId}</p>
        <p className="text-sm text-muted-foreground">
          Check the console logs for more details.
        </p>
      </div>
    </Card>
  );
};

export default ErrorDisplay;
