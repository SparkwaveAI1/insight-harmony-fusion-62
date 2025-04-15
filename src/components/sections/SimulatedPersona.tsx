
import { Sparkles } from "lucide-react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const SimulatedPersona = () => {
  return (
    <Section>
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">
                Build a Simulated Persona
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Use natural language to generate a realistic AI persona. Our system parses your input, rolls traits, and returns a fully interactive research subject—ready for interviews, group tests, or scenario simulations.
              </p>
              <Card className="p-6 bg-muted/40">
                <p className="text-sm text-muted-foreground mb-2">Example prompt:</p>
                <p className="text-primary font-medium">
                  "Crypto-savvy Gen Z woman, skeptical of authority, loves sustainability"
                </p>
              </Card>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <Card className="aspect-square relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
              <div className="text-center p-8">
                <Sparkles className="h-16 w-16 text-primary mb-6 mx-auto animate-pulse" />
                <p className="text-lg text-muted-foreground">
                  Interactive Persona Preview
                </p>
                <Button className="mt-6" disabled>Coming Soon</Button>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default SimulatedPersona;
