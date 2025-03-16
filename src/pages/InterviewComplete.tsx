
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Home } from "lucide-react";

const InterviewComplete = () => {
  const location = useLocation();
  const responses = location.state?.responses || {};
  
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
      <div className="mb-8 flex justify-center">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Interview Completed!</h1>
      
      <p className="text-xl mb-8">
        Thank you for completing the voice interview.
      </p>
      
      <div className="bg-card rounded-lg p-6 shadow-md mb-8 text-left">
        <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
        <p className="mb-4">
          Your responses will be analyzed to help create your personalized research avatar. This process typically takes 3-5 business days.
        </p>
        <p>
          We'll notify you by email when your research avatar is ready to view. You'll then be able to see how your perspectives are represented and provide additional feedback.
        </p>
      </div>
      
      <div className="flex justify-center">
        <Link to="/">
          <Button size="lg" className="group">
            <Home className="mr-2 h-4 w-4" /> Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default InterviewComplete;
