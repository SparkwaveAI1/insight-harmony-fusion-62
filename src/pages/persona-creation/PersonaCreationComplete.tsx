
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const PersonaCreationComplete = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <Card className="p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold">Questionnaire Completed</h1>
          
          <p className="text-lg text-gray-600 max-w-md">
            Thank you for completing the questionnaire! We will be in touch within 24 hours with information 
            about your Conversational Interview, the final step in creating your persona.
          </p>
          
          <div className="border-t border-gray-200 w-full pt-6 mt-6">
            <Button 
              onClick={() => navigate("/")}
              className="px-6"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PersonaCreationComplete;
