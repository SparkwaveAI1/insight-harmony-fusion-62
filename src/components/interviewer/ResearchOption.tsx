
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import ContactDialog from "@/components/contact/ContactDialog";

const ResearchOption = () => {
  return (
    <Card className="p-8 h-full flex flex-col">
      <div className="mb-6 pb-6 border-b">
        <h2 className="text-2xl font-bold mb-4 font-plasmik">2️⃣ Conduct Custom Research</h2>
        <p className="text-muted-foreground text-sm">For: Researchers, brands, protocols</p>
      </div>
      
      <div className="mb-8 flex-grow">
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-primary">🔹</span>
            <p>Use the Interviewer to run qualitative research with real people.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">🔹</span>
            <p>Consistent, scalable moderation—no human interviewer required.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">🔹</span>
            <p>Extract beliefs, motivations, and emotional responses in real time.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">🔹</span>
            <p>Analyze results through the PersonaAI dashboard for immediate strategic insight.</p>
          </li>
        </ul>
        
        <div className="mt-6 p-4 bg-muted/40 rounded-lg">
          <h3 className="font-medium mb-2">Use Case:</h3>
          <p className="text-sm text-muted-foreground">
            Want to understand what's driving community churn or resistance to staking? The Interviewer collects and analyzes human responses, giving you narrative insight with the speed of automation.
          </p>
        </div>
      </div>
      
      <ContactDialog 
        triggerButton={
          <Button className="w-full justify-center group mt-auto">
            Conduct Custom Research
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        }
        title="Start Custom Research Project"
        formType="custom-persona"
      />
    </Card>
  );
};

export default ResearchOption;
