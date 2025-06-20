
import { TraitProfile } from "@/services/persona/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

  const traitCategories = Object.keys(traitProfile);
  const expectedCategories = [
    'big_five', 'moral_foundations', 'world_values', 'political_compass',
    'behavioral_economics', 'cultural_dimensions', 'social_identity', 
    'extended_traits', 'dynamic_state'
  ];
  const foundCategories = expectedCategories.filter(cat => traitProfile[cat]);
  
  console.log("Available trait categories:", traitCategories);
  console.log("Expected categories found:", foundCategories);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
        Comprehensive Traits Profile ({foundCategories.length}/9 categories)
      </h2>
      
      <Accordion type="multiple" defaultValue={["big-five", "moral-foundations", "political-compass"]}>
        {/* Big Five */}
        {traitProfile.big_five && (
          <TraitCategory 
            value="big-five"
            title="Big Five Personality Traits"
            traits={traitProfile.big_five}
            highlightColor="bg-green-50"
            description="Core personality dimensions (OCEAN model)"
          />
        )}
        
        {/* Moral Foundations */}
        {traitProfile.moral_foundations && (
          <TraitCategory 
            value="moral-foundations"
            title="Moral Foundations"
            traits={traitProfile.moral_foundations}
            highlightColor="bg-blue-50"
            description="Moral reasoning patterns and priorities"
          />
        )}
        
        {/* World Values */}
        {traitProfile.world_values && (
          <TraitCategory 
            value="world-values"
            title="World Values Survey"
            traits={traitProfile.world_values}
            highlightColor="bg-amber-50"
            description="Cultural value orientations and priorities"
          />
        )}
        
        {/* Political Compass */}
        {traitProfile.political_compass && (
          <TraitCategory 
            value="political-compass"
            title="Political & Social Orientation"
            traits={traitProfile.political_compass}
            highlightColor="bg-purple-50"
            description="Political attitudes and group dynamics"
          />
        )}
        
        {/* Behavioral Economics */}
        {traitProfile.behavioral_economics && (
          <TraitCategory 
            value="behavioral-economics"
            title="Behavioral Economics"
            traits={traitProfile.behavioral_economics}
            highlightColor="bg-emerald-50"
            description="Decision-making patterns and biases"
          />
        )}
        
        {/* Cultural Dimensions */}
        {traitProfile.cultural_dimensions && (
          <TraitCategory 
            value="cultural-dimensions"
            title="Cultural Dimensions (Hofstede)"
            traits={traitProfile.cultural_dimensions}
            highlightColor="bg-orange-50"
            description="Cultural value orientations and behaviors"
          />
        )}
        
        {/* Social Identity */}
        {traitProfile.social_identity && (
          <TraitCategory 
            value="social-identity"
            title="Social Identity & Group Dynamics"
            traits={traitProfile.social_identity}
            highlightColor="bg-teal-50"
            description="Group membership and social behavior patterns"
          />
        )}
        
        {/* Extended Traits */}
        {traitProfile.extended_traits && (
          <TraitCategory 
            value="extended-traits"
            title="Extended Psychological Traits"
            traits={traitProfile.extended_traits}
            highlightColor="bg-gray-50"
            description="Additional personality and cognitive traits"
          />
        )}
        
        {/* Dynamic State */}
        {traitProfile.dynamic_state && (
          <TraitCategory 
            value="dynamic-state"
            title="Dynamic State Modifiers"
            traits={traitProfile.dynamic_state}
            highlightColor="bg-rose-50"
            description="Current psychological and emotional state"
          />
        )}
      </Accordion>
      
      {/* Category Coverage Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Trait Coverage Summary</h3>
        <div className="text-sm text-gray-600">
          <p>Generated {foundCategories.length} of 9 expected trait categories</p>
          {foundCategories.length < 9 && (
            <p className="text-amber-600 mt-1">
              Missing: {expectedCategories.filter(cat => !traitProfile[cat]).join(', ')}
            </p>
          )}
        </div>
      </div>
      
      {/* Debug Info */}
      <details className="mt-4 p-2 bg-gray-50 rounded text-xs">
        <summary className="cursor-pointer font-mono">Debug: Raw Trait Data</summary>
        <pre className="mt-2 overflow-auto max-h-40">
          {JSON.stringify(traitProfile, null, 2)}
        </pre>
      </details>
    </div>
  );
};

interface TraitCategoryProps {
  value: string;
  title: string;
  traits?: Record<string, any>;
  highlightColor: string;
  description?: string;
}

const TraitCategory = ({ value, title, traits, highlightColor, description }: TraitCategoryProps) => {
  console.log(`=== TRAIT CATEGORY: ${title} ===`);
  console.log("Traits data:", traits);
  
  if (!traits) {
    console.warn(`❌ No traits data for category: ${title}`);
    return (
      <AccordionItem value={value} className="border-0 mb-2">
        <AccordionTrigger className={`text-lg font-semibold py-2 px-3 ${highlightColor} rounded-md hover:opacity-90 transition-colors`}>
          {title} - No Data
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <p className="text-sm text-red-500 italic">No traits data available for this category</p>
        </AccordionContent>
      </AccordionItem>
    );
  }
  
  const traitEntries = Object.entries(traits);
  console.log(`${title} has ${traitEntries.length} trait entries:`, traitEntries.map(([k, v]) => `${k}=${v}`));
  
  // Handle nested objects like political_motivations
  const renderTraitValue = (key: string, value: any): React.ReactNode => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="ml-4 border-l-2 border-gray-200 pl-2 mb-2">
          <div className="font-medium capitalize mb-1">{key.replace(/_/g, ' ')}</div>
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey} className="flex justify-between items-center py-1 text-sm">
              <span className="capitalize text-gray-600">{subKey.replace(/_/g, ' ')}</span>
              <span className="font-medium">
                {typeof subValue === 'number' ? subValue.toFixed(2) : String(subValue)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
        <span className="capitalize text-gray-700">{key.replace(/_/g, ' ')}</span>
        <span className="font-medium text-gray-900">
          {typeof value === 'number' ? value.toFixed(2) : String(value)}
        </span>
      </div>
    );
  };
  
  return (
    <AccordionItem value={value} className="border-0 mb-2">
      <AccordionTrigger className={`text-lg font-semibold py-3 px-4 ${highlightColor} rounded-md hover:opacity-90 transition-colors`}>
        <div className="text-left">
          <div>{title}</div>
          {description && (
            <div className="text-sm font-normal text-gray-600 mt-1">{description}</div>
          )}
          <div className="text-sm font-normal text-gray-500 mt-1">
            {traitEntries.length} traits
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 px-4">
        <div className="space-y-1">
          {traitEntries.map(([key, value]) => renderTraitValue(key, value))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PersonaTraits;
