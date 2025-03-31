
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const InterviewPage = () => {
  const navigate = useNavigate();
  
  const handleFinishInterview = () => {
    // In a real implementation, this would save the interview data
    navigate("/thank-you");
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Interview Session</h1>
        <p className="text-gray-600">
          This is where the AI interview would take place.
        </p>
      </div>

      <div className="bg-muted/30 p-6 rounded-lg mb-6">
        <p className="mb-4">
          In the full implementation, this page would contain:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>AI-driven interview functionality</li>
          <li>Voice recording capabilities</li>
          <li>Real-time transcription</li>
          <li>Interactive conversation interface</li>
        </ul>
        <p>
          For now, this is a placeholder for the interview experience.
        </p>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleFinishInterview}>
          Complete Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewPage;
