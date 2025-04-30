
import { TraitProfile } from "@/services/persona/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PersonaTraitsProps {
  traitProfile: TraitProfile;
}

const PersonaTraits = ({ traitProfile }: PersonaTraitsProps) => {
  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-xl font-bold">Traits Profile</h2>
      
      <Accordion type="multiple" defaultValue={["big-five"]}>
        {/* Big Five */}
        <TraitCategory 
          value="big-five"
          title="Big Five Personality Traits"
          traits={traitProfile.big_five}
        />
        
        {/* Moral Foundations */}
        <TraitCategory 
          value="moral-foundations"
          title="Moral Foundations"
          traits={traitProfile.moral_foundations}
        />
        
        {/* World Values */}
        <TraitCategory 
          value="world-values"
          title="World Values"
          traits={traitProfile.world_values}
        />
        
        {/* Political Compass */}
        <TraitCategory 
          value="political-compass"
          title="Political Compass"
          traits={traitProfile.political_compass}
        />
        
        {/* Behavioral Economics */}
        <TraitCategory 
          value="behavioral-economics"
          title="Behavioral Economics"
          traits={traitProfile.behavioral_economics}
        />
        
        {/* Extended Traits */}
        <TraitCategory 
          value="extended-traits"
          title="Extended Traits"
          traits={traitProfile.extended_traits}
        />
      </Accordion>
    </div>
  );
};

interface TraitCategoryProps {
  value: string;
  title: string;
  traits?: Record<string, any>;
}

const TraitCategory = ({ value, title, traits }: TraitCategoryProps) => {
  if (!traits) return null;
  
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-lg font-semibold">{title}</AccordionTrigger>
      <AccordionContent>
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
