
import { Save, ArrowRight, Copy } from "lucide-react";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";

const SaveAccessSection = () => {
  return (
    <Section className="bg-muted/30">
      <div className="container px-4 mx-auto">
        <Reveal>
          <h2 className="text-3xl font-bold text-center mb-8 font-plasmik">
            Save & Access
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="max-w-3xl mx-auto mb-8">
            <Card className="p-6">
              <p className="text-center text-muted-foreground mb-6">
                Save your persona to your account, export it for integration with PersonaAI tools, 
                or use it immediately in a research session.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Persona
                </Button>
                <Button variant="secondary">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Use in Research
                </Button>
                <Button variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Clone or Modify
                </Button>
              </div>
            </Card>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

export default SaveAccessSection;
