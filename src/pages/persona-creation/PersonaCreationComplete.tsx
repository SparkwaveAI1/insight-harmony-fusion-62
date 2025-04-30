
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from "sonner";
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

const PersonaCreationComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const hasError = location.state?.error;
  const personaId = location.state?.personaId;
  
  useEffect(() => {
    if (hasError) {
      toast.error("Failed to create persona. Please try again.");
      setIsRedirecting(false);
      return;
    }

    // Show success toast
    toast.success("Persona created successfully!");
    
    // Add a slight delay to ensure the persona is saved
    const timer = setTimeout(() => {
      console.log("Redirecting to created persona...", personaId);
      
      if (personaId) {
        // Navigate directly to the created persona detail page
        navigate(`/persona-detail/${personaId}`);
      } else {
        // Fallback to My Personas page if no personaId is available
        console.log("No personaId available, redirecting to My Personas");
        navigate('/my-personas');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, hasError, personaId]);

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
        <div className="mb-6">
          {hasError ? (
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        
        {hasError ? (
          <>
            <h1 className="text-3xl font-bold mb-4">Persona Creation Failed</h1>
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
                onClick={handleViewPersonas}
                className="px-6 py-2 rounded-md transition-colors"
              >
                View My Personas
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">Persona Created Successfully!</h1>
            <p className="text-muted-foreground mb-8">
              Your persona has been saved. You'll be redirected to view it in a moment...
            </p>
            <Button 
              onClick={handleViewPersonas}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              {personaId ? "View My Persona" : "View My Personas"}
            </Button>
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default PersonaCreationComplete;
