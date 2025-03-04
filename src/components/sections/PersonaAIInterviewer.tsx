
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "../ui-custom/Section";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const PersonaAIInterviewerSection = () => {
  return (
    <Section className="bg-primary text-white py-20 md:py-28 overflow-hidden">
      <div className="container px-4 mx-auto relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground/5 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik text-white">
              AI Interviews at Scale—Instant Insights, No Delays.
            </h2>
          </Reveal>
          
          <Reveal delay={100}>
            <p className="text-primary-foreground/90 text-pretty max-w-2xl mx-auto mb-10">
              Get real consumer opinions, motivations, and decision-making patterns through AI-driven interviews—then analyze responses instantly with our research-grade AI Personas.
            </p>
          </Reveal>
          
          <Reveal delay={200}>
            <Link to="/persona-ai-interviewer">
              <Button 
                variant="secondary" 
                size="lg" 
                className="group border border-white/20 bg-white/10 hover:bg-white/20"
              >
                Try the PersonaAI Interviewer
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default PersonaAIInterviewerSection;
