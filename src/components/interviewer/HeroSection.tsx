
import Reveal from "@/components/ui-custom/Reveal";
import PersonaOption from "./PersonaOption";
import ResearchOption from "./ResearchOption";

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-background -z-10" />
      
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Reveal>
            <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
              PersonaAI Interviewer
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Reveal>
            <PersonaOption />
          </Reveal>
          <Reveal delay={200}>
            <ResearchOption />
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
