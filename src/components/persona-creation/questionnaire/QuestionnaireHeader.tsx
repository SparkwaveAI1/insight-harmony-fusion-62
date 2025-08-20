
import React from "react";
import { AlertTriangle } from "lucide-react";

const QuestionnaireHeader: React.FC = () => {
  return (
    <div className="text-center mb-6">
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-6 flex items-start">
        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-left">
          <strong>Important Notice:</strong> Due to legal restrictions on personal information, we're currently only collecting data from residents outside the EU and UK.
        </p>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">✅ Persona Pre-Interview Questionnaire</h1>
      <p className="text-gray-600 mb-2"><strong>Estimated time:</strong> 15–20 minutes</p>
      <p className="text-gray-600 mb-2"><strong>Format:</strong> Mostly multiple choice + a few short fill-ins</p>
      <p className="text-gray-600">
        <strong>Purpose:</strong> Capture foundational data to build deep, behaviorally accurate AI personas
      </p>
    </div>
  );
};

export default QuestionnaireHeader;
