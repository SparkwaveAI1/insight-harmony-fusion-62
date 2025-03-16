
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const AIVoiceInterview = () => {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">AI Voice Interview</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">What to expect</h2>
        <p className="mb-4">
          You're about to start a voice conversation with our AI interviewer. This will help us understand your perspective better.
        </p>
        
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>The interview consists of several questions asked by our AI</li>
          <li>You'll respond verbally - no typing required</li>
          <li>The conversation will be recorded and analyzed</li>
          <li>You can pause at any time and resume later</li>
          <li>Each interview session takes approximately 15-20 minutes</li>
        </ul>
        
        <div className="bg-muted p-4 rounded-md mb-6">
          <h3 className="font-medium mb-2">Before you begin:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Find a quiet place with minimal background noise</li>
            <li>Check that your microphone is working properly</li>
            <li>Allow browser permissions for microphone access when prompted</li>
          </ul>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Link to="/voice-interview-session">
          <Button size="lg" className="group">
            Start Voice Interview
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AIVoiceInterview;
