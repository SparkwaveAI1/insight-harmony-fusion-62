import { Rocket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-slate-900"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 -z-10">
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute h-40 w-40 rounded-full bg-primary/20 blur-3xl top-1/4 left-1/4 animate-pulse"></div>
          <div className="absolute h-60 w-60 rounded-full bg-accent/20 blur-3xl bottom-1/3 right-1/3 animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute h-20 w-20 rounded-full bg-primary/20 blur-3xl top-1/3 right-1/4 animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>
      </div>
      
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal delay={100} animation="blur-in">
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-tight tracking-tight font-plasmik text-balance text-white drop-shadow-md">
              Market Research, Reimagined: AI-Driven Qualitative Insights
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="mb-10 text-lg md:text-xl text-gray-300 text-pretty max-w-2xl mx-auto">
              AI Personas—digital consumers built from real human interviews. Run AI-driven focus groups, analyze sentiment shifts, and predict market behavior—faster and at scale.
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-wrap gap-6 justify-center">
              <Button 
                as={Link}
                to="/research"
                className="py-6 px-8 text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 flex items-center rounded-md"
              >
                PersonaAI Researcher
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                as={Link}
                to="/interviewer"
                className="py-6 px-8 text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 flex items-center rounded-md"
              >
                PersonaAI Interviewer
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
      
      {/* Hero Image - removing this based on screenshots */}
    </section>
  );
};

export default Hero;
