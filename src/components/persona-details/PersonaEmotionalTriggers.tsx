
import { EmotionalTriggersProfile } from "@/services/persona/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface PersonaEmotionalTriggersProps {
  emotionalTriggers?: EmotionalTriggersProfile;
}

const PersonaEmotionalTriggers = ({ emotionalTriggers }: PersonaEmotionalTriggersProps) => {
  if (!emotionalTriggers) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
        Emotional Triggers
      </h2>
      
      <Accordion type="multiple" defaultValue={["positive-triggers", "negative-triggers"]}>
        {/* Positive Triggers */}
        {emotionalTriggers.positive_triggers && emotionalTriggers.positive_triggers.length > 0 && (
          <AccordionItem value="positive-triggers" className="border-0 mb-2">
            <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-green-50 rounded-md hover:opacity-90 transition-colors">
              Positive Triggers ({emotionalTriggers.positive_triggers.length})
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                {emotionalTriggers.positive_triggers.map((trigger, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-green-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        {trigger.emotion_type || 'Unknown'}
                      </Badge>
                      <span className="text-sm font-medium text-green-700">
                        Intensity: {trigger.intensity_multiplier || 0}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{trigger.description || 'No description available'}</p>
                    <div className="flex flex-wrap gap-1">
                      {(trigger.keywords || []).map((keyword, keyIndex) => (
                        <Badge key={keyIndex} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        
        {/* Negative Triggers */}
        {emotionalTriggers.negative_triggers && emotionalTriggers.negative_triggers.length > 0 && (
          <AccordionItem value="negative-triggers" className="border-0 mb-2">
            <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-red-50 rounded-md hover:opacity-90 transition-colors">
              Negative Triggers ({emotionalTriggers.negative_triggers.length})
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                {emotionalTriggers.negative_triggers.map((trigger, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-red-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                        {trigger.emotion_type || 'Unknown'}
                      </Badge>
                      <span className="text-sm font-medium text-red-700">
                        Intensity: {trigger.intensity_multiplier || 0}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{trigger.description || 'No description available'}</p>
                    <div className="flex flex-wrap gap-1">
                      {(trigger.keywords || []).map((keyword, keyIndex) => (
                        <Badge key={keyIndex} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default PersonaEmotionalTriggers;
