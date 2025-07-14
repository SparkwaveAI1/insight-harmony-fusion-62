
import React from "react";
import { MessageCircle, Lightbulb, TrendingUp, Shield } from "lucide-react";
import { getCommunicationStyle, getStressResponse, interpretBigFive, interpretMoralFoundations } from "./utils/traitHelpers";

interface PersonaKeyInsightsProps {
  metadata: any;
}

const PersonaKeyInsights = ({ metadata }: PersonaKeyInsightsProps) => {
  console.log("PersonaKeyInsights received metadata:", metadata);
  console.log("Trait profile:", metadata?.trait_profile);

  const traitProfile = metadata?.trait_profile;
  
  if (!traitProfile) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-primary mr-2"></span>
          Key Insights
        </h2>
        <div className="bg-muted rounded-lg p-6 text-center">
          <p className="text-muted-foreground">No trait profile data available for insights.</p>
        </div>
      </div>
    );
  }

  const communicationStyle = getCommunicationStyle(traitProfile);
  const stressResponse = getStressResponse(traitProfile);
  const bigFiveData = interpretBigFive(traitProfile.big_five);
  const moralData = interpretMoralFoundations(traitProfile.moral_foundations);

  // Generate motivation insights
  const getMotivationInsights = () => {
    const insights = [];
    
    if (bigFiveData?.conscientiousness?.score && bigFiveData.conscientiousness.score >= 0.6) {
      insights.push("Motivated by achievement and completing goals");
    }
    if (bigFiveData?.openness?.score && bigFiveData.openness.score >= 0.6) {
      insights.push("Driven by learning and novel experiences");
    }
    if (moralData?.care?.score && moralData.care.score >= 0.6) {
      insights.push("Motivated to help others and prevent harm");
    }
    if (moralData?.fairness?.score && moralData.fairness.score >= 0.6) {
      insights.push("Driven by justice and equal treatment");
    }
    if (bigFiveData?.extraversion?.score && bigFiveData.extraversion.score >= 0.6) {
      insights.push("Energized by social interaction and recognition");
    }
    
    return insights.length > 0 ? insights : ["Balanced motivation across multiple areas"];
  };

  // Generate growth insights
  const getGrowthInsights = () => {
    const insights = [];
    
    if (bigFiveData?.neuroticism?.score && bigFiveData.neuroticism.score >= 0.6) {
      insights.push("Could benefit from stress management techniques");
    }
    if (bigFiveData?.openness?.score && bigFiveData.openness.score <= 0.4) {
      insights.push("Might grow from exposure to new perspectives");
    }
    if (bigFiveData?.agreeableness?.score && bigFiveData.agreeableness.score <= 0.4) {
      insights.push("Could develop stronger collaborative skills");
    }
    if (traitProfile.extended_traits?.self_awareness && traitProfile.extended_traits.self_awareness <= 0.4) {
      insights.push("Would benefit from self-reflection practices");
    }
    
    return insights.length > 0 ? insights : ["Well-rounded personality with balanced growth"];
  };

  const motivationInsights = getMotivationInsights();
  const growthInsights = getGrowthInsights();

  const InsightCard = ({ title, Icon, insights, color }: { title: string; Icon: any; insights: string[]; color: string }) => (
    <div className="bg-card rounded-lg p-6 border">
      <div className="flex items-center mb-4">
        <Icon className={`h-5 w-5 ${color} mr-2`} />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start">
            <span className="text-primary mr-2 text-sm">•</span>
            <span className="text-muted-foreground text-sm">{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-primary mr-2"></span>
        Key Insights
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard 
          title="Communication" 
          Icon={MessageCircle} 
          insights={communicationStyle} 
          color="text-blue-500"
        />
        <InsightCard 
          title="Motivation" 
          Icon={TrendingUp} 
          insights={motivationInsights} 
          color="text-green-500"
        />
        <InsightCard 
          title="Stress Response" 
          Icon={Shield} 
          insights={stressResponse} 
          color="text-orange-500"
        />
        <InsightCard 
          title="Growth Areas" 
          Icon={Lightbulb} 
          insights={growthInsights} 
          color="text-purple-500"
        />
      </div>
    </div>
  );
};

export default PersonaKeyInsights;
