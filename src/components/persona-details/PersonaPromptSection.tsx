
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Card from "@/components/ui-custom/Card";

interface PersonaPromptSectionProps {
  prompt?: string;
}

const PersonaPromptSection = ({ prompt }: PersonaPromptSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!prompt) return null;
  
  return (
    <Card className="p-6 shadow-md bg-white border-gray-100 max-w-none">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
            Original Prompt
          </h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0 hover:bg-slate-100">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="mt-2">
          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm italic">"{prompt}"</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default PersonaPromptSection;
