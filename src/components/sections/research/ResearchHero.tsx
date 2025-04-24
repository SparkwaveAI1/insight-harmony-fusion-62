
import Reveal from "@/components/ui-custom/Reveal";

const ResearchHero = () => {
  return (
    <section className="relative min-h-[70vh] pt-24 pb-16 flex items-center bg-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <h1 className="mb-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik">
              Run Advanced Behavioral Research with AI or Human-Based Personas
            </h1>
            <div className="w-32 h-1 bg-accent mx-auto mb-6"></div>
          </Reveal>
          
          <Reveal delay={100}>
            <p className="mb-10 text-lg text-muted-foreground max-w-3xl mx-auto">
              PersonaAI lets you conduct qualitative research using advanced AI personas or 
              real human-derived profiles—delivering deep insights at scale.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ResearchHero;
