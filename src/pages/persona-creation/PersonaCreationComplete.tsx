
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from "sonner";

const PersonaCreationComplete = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show success toast
    toast.success("Persona created successfully!");
    
    // Add a slight delay to ensure the persona is saved
    const timer = setTimeout(() => {
      console.log("Redirecting to My Personas page...");
      navigate('/my-personas');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Persona Created Successfully!</h1>
        <p className="text-muted-foreground mb-8">
          Your persona has been saved to your account. You'll be redirected to your personas in a moment...
        </p>
        <button 
          onClick={() => navigate('/my-personas')}
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          View My Personas
        </button>
      </div>
      <Toaster />
    </div>
  );
};

export default PersonaCreationComplete;
