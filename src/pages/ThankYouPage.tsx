
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const ThankYouPage = () => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    // Clear session data
    sessionStorage.removeItem("participant_id");
    sessionStorage.removeItem("participant_email");
    navigate("/");
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl text-center">
      <div className="mb-8">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You for Participating!</h1>
        
        <p className="text-gray-600 mb-6">
          Your contribution is invaluable to our research. The information you've provided
          will help us create more accurate AI personas.
        </p>
      </div>
      
      <div className="bg-muted/30 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">What Happens Next?</h2>
        
        <div className="space-y-4 text-left">
          <p>
            <span className="font-medium">Data Processing:</span> Your responses will be anonymized and analyzed to create accurate AI personas.
          </p>
          <p>
            <span className="font-medium">AI Training:</span> The insights will help train our AI to better understand human behaviors and preferences.
          </p>
          <p>
            <span className="font-medium">Research Impact:</span> Your participation contributes to improving AI-driven qualitative research methods.
          </p>
        </div>
      </div>
      
      <Button onClick={handleGoHome} size="lg">
        Return to Homepage
      </Button>
    </div>
  );
};

export default ThankYouPage;
