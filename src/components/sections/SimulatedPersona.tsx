
import { Sparkles } from "lucide-react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const SimulatedPersona = () => {
  return (
    <Section className="bg-white py-16">
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">
                Build a Simulated Persona
              </h2>
              <div className="w-24 h-1 bg-accent mb-6"></div>
              <p className="text-lg text-muted-foreground mb-8">
                Use natural language to generate a realistic AI persona. Our system parses your input, rolls traits, and returns a fully interactive research subject—ready for interviews, group tests, or scenario simulations.
              </p>
              <Card className="p-6 bg-muted border-l-4 border-l-accent">
                <p className="text-sm text-muted-foreground mb-2">Example prompt:</p>
                <p className="text-primary font-medium">
                  "Crypto-savvy Gen Z woman, skeptical of authority, loves sustainability"
                </p>
              </Card>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <Card className="aspect-square relative overflow-hidden border-t-2 border-t-accent bg-muted/10 flex items-center justify-center shadow-sm">
              <div className="text-center p-8">
                <Sparkles className="h-16 w-16 text-accent mb-6 mx-auto animate-pulse" />
                <p className="text-lg text-muted-foreground">
                  Interactive Persona Preview
                </p>
                <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90" disabled>Coming Soon</Button>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default SimulatedPersona;
