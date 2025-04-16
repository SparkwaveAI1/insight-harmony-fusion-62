
import { FileJson } from "lucide-react";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Reveal from "@/components/ui-custom/Reveal";

const WhyDifferentSection = () => {
  return (
    <Section>
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl font-bold text-center mb-8 font-plasmik">
              Realistic Personas. No Stereotypes.
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <Card className="p-6 mb-8">
              <ul className="space-y-4">
                {[
                  "Demographic distributions sourced from Pew, WVS, Gallup",
                  "Traits include risk, trust, political orientation, impulse control, empathy",
                  "Nonlinear interactions between traits = emergent behavior",
                  "Stored as structured .json files for advanced use"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default WhyDifferentSection;
