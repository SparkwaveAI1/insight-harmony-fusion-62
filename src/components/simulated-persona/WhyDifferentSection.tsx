
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Reveal from "@/components/ui-custom/Reveal";

const WhyDifferentSection = () => {
  return (
    <Section 
      className="bg-gradient-to-br from-[#1A1F2C] via-[#222222] to-[#0A0A0A] text-gray-100"
    >
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl font-bold text-center mb-8 font-plasmik text-white">
              Realistic Personas. No Stereotypes.
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <Card className="p-6 mb-8 bg-black/30 backdrop-blur-lg border-white/10 border">
              <ul className="space-y-4">
                {[
                  "Demographic distributions sourced from Pew, WVS, Gallup",
                  "Traits include risk, trust, political orientation, impulse control, empathy",
                  "Nonlinear interactions between traits = emergent behavior",
                  "Stored as structured .json files for advanced use"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <div className="rounded-full bg-white/20 p-1 mt-0.5">
                      <svg 
                        className="h-4 w-4 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
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

