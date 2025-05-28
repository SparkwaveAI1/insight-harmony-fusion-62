
import React from "react";
import Card from "@/components/ui-custom/Card";
import PersonaKeyInsights from "./PersonaKeyInsights";
import PersonaDemographics from "./PersonaDemographics";
import PersonaTraits from "./PersonaTraits";
import PersonaEmotionalTriggers from "./PersonaEmotionalTriggers";
import InterviewResponses from "./InterviewResponses";
import PersonaPromptSection from "./PersonaPromptSection";
import { Persona } from "@/services/persona";

interface PersonaContentProps {
  persona: Persona;
}

const PersonaContent = ({ persona }: PersonaContentProps) => {
  // Enhanced metadata to include persona_id for proper identification in the PersonaKeyInsights component
  const getEnhancedMetadata = () => {
    return {
      ...persona.metadata,
      persona_id: persona.persona_id,
      name: persona.name
    };
  };

  const getInterviewSections = () => {
    if (!persona?.interview_sections) return [];
    
    // Get the raw sections data
    let rawSections = [];
    
    if (Array.isArray(persona.interview_sections)) {
      rawSections = persona.interview_sections;
    } else if ('interview_sections' in persona.interview_sections) {
      rawSections = persona.interview_sections.interview_sections || [];
    }
    
    // Map the raw sections to the format expected by the InterviewResponses component
    return rawSections.map(section => {
      // Create a responses array from questions and responses
      const responses = [];
      
      // Try to extract responses from the section
      if (section.questions && Array.isArray(section.questions)) {
        section.questions.forEach((q, idx) => {
          // Handle different question formats
          if (typeof q === 'string' && section.responses && section.responses[idx]) {
            responses.push({
              question: q,
              answer: section.responses[idx]
            });
          } else if (typeof q === 'object' && q.question) {
            responses.push({
              question: q.question,
              answer: q.response || 'No response recorded'
            });
          }
        });
      }
      
      return {
        section_title: section.section || 'Interview Section',
        responses: responses
      };
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="p-6 shadow-md bg-white border-gray-100">
        <div className="bg-[#F8F9FA] p-6 rounded-lg mb-6">
          <PersonaKeyInsights metadata={getEnhancedMetadata()} />
        </div>
        
        <div className="bg-[#F5F5F7] p-6 rounded-lg mb-6">
          <PersonaDemographics metadata={persona.metadata} />
        </div>
      </Card>
      
      <Card className="p-6 shadow-md bg-white border-gray-100">
        <PersonaTraits traitProfile={persona.trait_profile} />
      </Card>
      
      {persona.emotional_triggers && (
        <Card className="p-6 shadow-md bg-white border-gray-100">
          <PersonaEmotionalTriggers emotionalTriggers={persona.emotional_triggers} />
        </Card>
      )}
      
      <InterviewResponses sections={getInterviewSections()} />
      
      <PersonaPromptSection prompt={persona.prompt} />
    </div>
  );
};

export default PersonaContent;
