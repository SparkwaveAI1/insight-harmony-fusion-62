
import { Users, Beaker, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen pt-24 pb-16 flex items-center justify-center"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-background -z-10">
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute h-40 w-40 rounded-full bg-primary/30 blur-3xl top-1/4 left-1/4 animate-pulse"></div>
          <div className="absolute h-60 w-60 rounded-full bg-accent/20 blur-3xl bottom-1/3 right-1/3 animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute h-20 w-20 rounded-full bg-primary/20 blur-3xl top-1/3 right-1/4 animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 flex flex-col items-center">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal delay={100} animation="blur-in">
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-tight tracking-tight font-plasmik text-balance text-white drop-shadow-md">
              Market Research, Reimagined: Insight from Digital Minds
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="mb-10 text-lg md:text-xl text-gray-300 text-pretty max-w-2xl mx-auto">
              Behaviorally rich AI personas for research, testing, and decision forecasting. 
              From real interviews to strategic simulations, PersonaAI lets you model human thinking for research and insight.
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="group py-6 px-8 text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 w-full sm:w-auto"
                as={Link}
                to="/simulated-persona"
                variant="primary"
              >
                Create a Simulated Persona
                <Beaker className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              </Button>

              <Button 
                size="lg" 
                className="group py-6 px-8 text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg w-full sm:w-auto"
                as={Link}
                to="/research"
                variant="primary"
              >
                Run Research Simulations
                <Search className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Hero;
