
import { useState } from "react";
import { Users, Beaker, Search, LogIn, CreditCard, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";
import { useAuth } from "@/context/AuthContext";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { CreditGate } from "@/components/ui/CreditGate";

const Hero = () => {
  const { user } = useAuth();
  const { balance, isLoading } = useCreditBalance();
  const [showCreditGate, setShowCreditGate] = useState(false);
  const [gateFeature, setGateFeature] = useState("");

  const handleFeatureClick = (feature: string, requiresCredits: boolean = true) => {
    if (!user) {
      return; // Let the Link handle navigation to sign-in
    }
    
    if (requiresCredits && balance !== null && balance <= 0) {
      setGateFeature(feature);
      setShowCreditGate(true);
      return false; // Prevent navigation
    }
    
    return true; // Allow navigation
  };

  const renderCTAButton = (
    text: string,
    icon: React.ReactNode,
    href: string,
    feature: string,
    requiresCredits: boolean = true
  ) => {
    if (!user) {
      return (
        <Button 
          size="lg" 
          className="group py-6 px-8 text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 w-full sm:w-auto"
          as={Link}
          to="/sign-in"
          variant="primary"
        >
          <LogIn className="mr-2 h-5 w-5" />
          Sign In to {text}
        </Button>
      );
    }

    if (requiresCredits && balance !== null && balance <= 0) {
      return (
        <Button 
          size="lg" 
          className="group py-6 px-8 text-lg bg-orange-600 hover:bg-orange-700 transition-all shadow-lg w-full sm:w-auto"
          onClick={() => {
            setGateFeature(feature);
            setShowCreditGate(true);
          }}
          variant="primary"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Get Credits to {text}
        </Button>
      );
    }

    return (
      <Button 
        size="lg" 
        className="group py-6 px-8 text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 w-full sm:w-auto"
        as={Link}
        to={href}
        variant="primary"
        onClick={(e: React.MouseEvent) => {
          if (!handleFeatureClick(feature, requiresCredits)) {
            e.preventDefault();
          }
        }}
      >
        {text}
        {icon}
      </Button>
    );
  };
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
          
          <Reveal delay={250}>
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 rounded-full text-white text-lg font-bold shadow-2xl shadow-yellow-500/50 animate-pulse">
                <Zap className="h-6 w-6 text-white fill-white" />
                New users get 200 free credits to get started!
              </div>
            </div>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              {renderCTAButton(
                "Create a Simulated Persona",
                <Beaker className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />,
                "/persona-creator",
                "persona creation"
              )}

              {renderCTAButton(
                "Run Research Simulations", 
                <Search className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />,
                "/research",
                "research simulations"
              )}
            </div>
            
            {/* Secondary CTA for non-logged in users */}
            {!user && (
              <div className="flex justify-center">
                <Link to="/pricing" className="text-blue-300 hover:text-blue-200 transition-colors text-sm underline">
                  View Pricing & Features →
                </Link>
              </div>
            )}
          </Reveal>

          <CreditGate
            isOpen={showCreditGate}
            onClose={() => setShowCreditGate(false)}
            feature={gateFeature}
            creditsRequired={1}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
