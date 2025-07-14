import { TraitProfile } from "@/services/persona/types";
import { interpretBigFive, interpretMoralFoundations, interpretDecisionMaking, getCommunicationStyle, getStressResponse } from "./utils/traitHelpers";

interface PersonaTraitsProps {
  traitProfile: TraitProfile;
}

const PersonaTraits = ({ traitProfile }: PersonaTraitsProps) => {
  console.log("=== PERSONA TRAITS COMPONENT DEBUG ===");
  console.log("Received traitProfile:", traitProfile);
  console.log("TraitProfile type:", typeof traitProfile);
  
  if (!traitProfile) {
    console.error("❌ No trait profile provided to PersonaTraits component");
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-red-600">
          Error: No trait profile data available
        </h2>
        <p className="text-muted-foreground">The trait profile is missing or undefined.</p>
      </div>
    );
  }

  const bigFiveData = interpretBigFive(traitProfile.big_five);
  const moralData = interpretMoralFoundations(traitProfile.moral_foundations);
  const decisionStyle = interpretDecisionMaking(traitProfile.behavioral_economics);
  const communicationStyle = getCommunicationStyle(traitProfile);
  const stressResponse = getStressResponse(traitProfile);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-primary mr-2"></span>
        Personality Profile
      </h2>
      
      {/* Big Five Personality Traits */}
      {bigFiveData && (
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Core Personality Traits</h3>
          <div className="space-y-3">
            {Object.entries(bigFiveData).map(([trait, data]) => (
              data.description && (
                <div key={trait} className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-medium text-foreground capitalize">{trait.replace('_', ' ')}: </span>
                    <span className="text-muted-foreground">{data.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2 font-mono">
                    {data.level}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Core Values */}
      {moralData && (
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Core Values & Moral Foundations</h3>
          <div className="space-y-3">
            {Object.entries(moralData)
              .filter(([_, data]) => data.description)
              .sort((a, b) => (b[1].score || 0) - (a[1].score || 0))
              .map(([foundation, data]) => (
                <div key={foundation} className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-medium text-foreground capitalize">{foundation}: </span>
                    <span className="text-muted-foreground">{data.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {data.priority}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Decision Making Style */}
      {decisionStyle && (
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Decision Making Style</h3>
          <div className="space-y-2">
            {decisionStyle.styles.map((style, index) => (
              <div key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-muted-foreground">{style}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Communication & Social Style */}
      {communicationStyle && communicationStyle.length > 0 && (
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Communication Style</h3>
          <div className="space-y-2">
            {communicationStyle.map((style, index) => (
              <div key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-muted-foreground">{style}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stress Response */}
      {stressResponse && stressResponse.length > 0 && (
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Stress Response & Pressure Handling</h3>
          <div className="space-y-2">
            {stressResponse.map((response, index) => (
              <div key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-muted-foreground">{response}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Coverage Summary */}
      <details className="mt-4 p-3 bg-muted rounded text-sm">
        <summary className="cursor-pointer font-medium text-muted-foreground">
          View Technical Coverage Details
        </summary>
        <div className="mt-2 space-y-1 text-muted-foreground text-xs">
          <p>• Big Five Personality: {bigFiveData ? "✓ Available" : "✗ No data"}</p>
          <p>• Moral Foundations: {moralData ? "✓ Available" : "✗ No data"}</p>
          <p>• Behavioral Economics: {decisionStyle ? "✓ Available" : "✗ No data"}</p>
          <p>• Cultural Dimensions: {traitProfile.cultural_dimensions ? "✓ Available" : "✗ No data"}</p>
          <p>• Extended Traits: {traitProfile.extended_traits ? "✓ Available" : "✗ No data"}</p>
        </div>
      </details>
    </div>
  );
};

export default PersonaTraits;
