
import Reveal from "@/components/ui-custom/Reveal";

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background -z-10" />
      
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
              PersonaAI Interviewer
            </p>
          </Reveal>
          
          <Reveal delay={100} animation="blur-in">
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik text-balance">
              Structured Interviews for Persona Creation & Research
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="mb-10 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Create rich, human-derived AI Personas or run research studies with real participants—using our automated interviewer designed for realism, depth, and scale.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
