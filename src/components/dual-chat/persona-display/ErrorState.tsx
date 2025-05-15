
import React from 'react';

interface ErrorStateProps {
  personaId: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ personaId }) => {
  return (
    <div className="border rounded-md p-4 bg-[#F5F5F7]">
      <p className="font-semibold">Persona {personaId ? '(Not Loaded)' : ''}</p>
      <p className="text-sm text-muted-foreground">ID: {personaId}</p>
      <div className="mt-2 text-red-500 text-sm">
        Error: Persona could not be loaded. Please check the ID and try again.
      </div>
    </div>
  );
};

export default ErrorState;
