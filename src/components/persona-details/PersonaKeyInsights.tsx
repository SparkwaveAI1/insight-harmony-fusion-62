
import React from "react";
import { Brain, Target, Users } from "lucide-react";
import { generateUniqueInsights } from "./insights/generateUniqueInsights";
import InsightSection from "./insights/InsightSection";

interface PersonaKeyInsightsProps {
  metadata: any;
}

const PersonaKeyInsights = ({ metadata }: PersonaKeyInsightsProps) => {
  // Add debugging to see what data we're working with
  console.log("PersonaKeyInsights received metadata:", metadata);
  console.log("Persona ID:", metadata?.persona_id);
  console.log("Trait profile:", metadata?.trait_profile);

  // Get the personalized insights
  const personaId = metadata?.persona_id;
  const insights = generateUniqueInsights(personaId, metadata);
  
  console.log("Generated insights:", insights);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
        Key Insights
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightSection 
          title="Decisions" 
          Icon={Brain} 
          insights={insights.decisions} 
        />
        <InsightSection 
          title="Drivers" 
          Icon={Target} 
          insights={insights.drivers} 
        />
        <InsightSection 
          title="Discussion & Persuasion" 
          Icon={Users} 
          insights={insights.persuasion} 
        />
      </div>
    </div>
  );
};

export default PersonaKeyInsights;
