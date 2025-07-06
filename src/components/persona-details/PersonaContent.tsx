
import React from "react";
import { Persona } from "@/services/persona/types";
import PersonaTraits from "./PersonaTraits";
import PersonaCloneForm from "./PersonaCloneForm";
import PersonaDemographics from "./PersonaDemographics"; 
import PersonaKnowledgeDomains from "./PersonaKnowledgeDomains";
import PersonaEmotionalTriggers from "./PersonaEmotionalTriggers";

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

      {/* Demographics Section */}
      {persona.metadata && (
        <PersonaDemographics metadata={persona.metadata} />
      )}

      {/* Knowledge Domains Section */}
      {persona.metadata && (
        <PersonaKnowledgeDomains metadata={persona.metadata} />
      )}

      {/* Emotional Triggers Section */}
      {persona.emotional_triggers && (
        <PersonaEmotionalTriggers emotionalTriggers={persona.emotional_triggers} />
      )}

      {/* Psychological Profile Section */}
      {persona.trait_profile && (
        <PersonaTraits traitProfile={persona.trait_profile} />
      )}
    </div>
  );
};

export default PersonaContent;
