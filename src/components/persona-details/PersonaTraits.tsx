
import { TraitProfile } from "@/services/persona/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PersonaTraitsProps {
  traitProfile: TraitProfile;
}

const PersonaTraits = ({ traitProfile }: PersonaTraitsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
        Traits Profile
      </h2>
      
      <Accordion type="multiple" defaultValue={["big-five", "moral-foundations"]}>
        {/* Big Five */}
        <TraitCategory 
          value="big-five"
          title="Big Five Personality Traits"
          traits={traitProfile.big_five}
          highlightColor="bg-green-50"
        />
        
        {/* Moral Foundations */}
        <TraitCategory 
          value="moral-foundations"
          title="Moral Foundations"
          traits={traitProfile.moral_foundations}
          highlightColor="bg-blue-50"
        />
        
        {/* World Values */}
        <TraitCategory 
          value="world-values"
          title="World Values"
          traits={traitProfile.world_values}
          highlightColor="bg-amber-50"
        />
        
        {/* Political Compass */}
        <TraitCategory 
          value="political-compass"
          title="Political Compass"
          traits={traitProfile.political_compass}
          highlightColor="bg-purple-50"
        />
        
        {/* Behavioral Economics */}
        <TraitCategory 
          value="behavioral-economics"
          title="Behavioral Economics"
          traits={traitProfile.behavioral_economics}
          highlightColor="bg-blue-50"
        />
        
        {/* Extended Traits */}
        <TraitCategory 
          value="extended-traits"
          title="Extended Traits"
          traits={traitProfile.extended_traits}
          highlightColor="bg-gray-50"
        />
      </Accordion>
    </div>
  );
};

interface TraitCategoryProps {
  value: string;
  title: string;
  traits?: Record<string, any>;
  highlightColor: string;
}

const TraitCategory = ({ value, title, traits, highlightColor }: TraitCategoryProps) => {
  if (!traits) return null;
  
  return (
    <AccordionItem value={value} className="border-0 mb-2">
      <AccordionTrigger className={`text-lg font-semibold py-2 px-3 ${highlightColor} rounded-md hover:opacity-90 transition-colors`}>
        {title}
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        <div className="grid gap-2">
          {Object.entries(traits).length > 0 ? (
            Object.entries(traits).map(([trait, value]) => (
              value && (
                <div key={trait} className="flex justify-between items-center py-1 border-b border-muted last:border-0">
                  <span className="capitalize">{trait.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{value}</span>
                </div>
              )
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">No traits available</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PersonaTraits;
