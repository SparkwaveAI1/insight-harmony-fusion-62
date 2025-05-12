
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";

const PersonaOption = () => {
  return (
    <Card className="p-8 h-full flex flex-col">
      <div className="mb-6 pb-6 border-b">
        <h2 className="text-2xl font-bold mb-4 font-plasmik">1️⃣ Build a Persona</h2>
        <p className="text-muted-foreground text-sm">For: Individuals, businesses, researchers</p>
      </div>
      
      <div className="mb-8 flex-grow">
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-primary">🔹</span>
            <p>Create a human-derived AI Persona through a structured interview.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">🔹</span>
            <p>Based on real decisions, not assumptions—your responses shape how the AI thinks.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">🔹</span>
            <p>Use your Persona privately, in your business, or license it for future research and earn $PRSNA.</p>
          </li>
        </ul>
        
        <div className="mt-6 p-4 bg-muted/40 rounded-lg">
          <h3 className="font-medium mb-2">Use Case:</h3>
          <p className="text-sm text-muted-foreground">
            Want to create a thinking replica of yourself for strategy, automation, or AI-based interaction? The Interviewer captures your values, thought patterns, and decision logic—then builds a persona you can use or monetize.
          </p>
        </div>
      </div>
      
      <div className="mt-auto space-y-3">
        <Button 
          className="w-full justify-center group" 
          disabled={true}
        >
          Create a Persona
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
        <p className="text-sm text-center text-amber-600 font-medium">
          Interviewer scheduled to go live mid-May 2025
        </p>
      </div>
    </Card>
  );
};

export default PersonaOption;
