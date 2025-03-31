
import React from "react";

const QuestionnaireHeader: React.FC = () => {
  return (
    <div className="text-center mb-6">
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
