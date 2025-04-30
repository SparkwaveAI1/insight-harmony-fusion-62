
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from "sonner";
import { toast } from "sonner";
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PersonaCreationComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  const hasError = location.state?.error;
  const errorMessage = location.state?.errorMessage || "Unknown error occurred.";
  const personaId = location.state?.personaId;
  const personaName = location.state?.personaName || "your persona";
  
  useEffect(() => {
    if (hasError) {
      toast.error("Failed to create persona.");
      console.error("Persona creation failed:", errorMessage);
      setIsRedirecting(false);
      return;
    }

    if (!personaId) {
      toast.error("No persona ID received.");
      setIsRedirecting(false);
      return;
    }

    // Show success toast
    toast.success(`"${personaName}" created successfully!`);
    
    // Add a slight delay to ensure the toast is visible
    const timer = setTimeout(() => {
      console.log("Redirecting to created persona...", personaId);
      navigate(`/persona-detail/${personaId}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, hasError, personaId, personaName, errorMessage]);

  const handleRetry = () => {
    navigate('/simulated-persona');
  };

  const handleViewPersonas = () => {
    if (personaId) {
      navigate(`/persona-detail/${personaId}`);
    } else {
      navigate('/my-personas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        {hasError ? (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Persona Creation Failed</h1>
            
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
            
            <p className="text-muted-foreground mb-8">
              There was an error creating your persona. You can try again or view your existing personas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleRetry}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/my-personas')}
                className="px-6 py-2 rounded-md transition-colors"
              >
                View My Personas
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Persona Created Successfully!</h1>
            <p className="text-muted-foreground mb-8">
              {personaId ? 
                `"${personaName}" has been saved. You'll be redirected to view it in a moment...` : 
                "Your persona has been saved. You'll be redirected to view it in a moment..."
              }
            </p>
            <Button 
              onClick={handleViewPersonas}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              {personaId ? `View ${personaName}` : "View My Personas"}
            </Button>
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default PersonaCreationComplete;
