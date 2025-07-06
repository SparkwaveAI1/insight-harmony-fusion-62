import React from "react";
import { Persona } from "@/services/persona/types";
import PersonaMetadata from "./PersonaMetadata";
import PersonaTraits from "./PersonaTraits";
import PersonaInterview from "./PersonaInterview";
import PersonaCloneForm from "./PersonaCloneForm";

interface PersonaContentProps {
  persona: Persona;
}

const PersonaContent = ({ persona }: PersonaContentProps) => {
  return (
    <div className="space-y-8">
      {/* Clone & Customize Button - Prominent placement */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Create Your Own Version
            </h3>
            <p className="text-sm text-gray-600">
              Generate a customized persona based on this one with your specific modifications
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <PersonaCloneForm persona={persona} />
          </div>
        </div>
      </div>

      {/* Existing content */}
      <PersonaMetadata persona={persona} />
      <PersonaTraits persona={persona} />
      <PersonaInterview persona={persona} />
    </div>
  );
};

export default PersonaContent;
