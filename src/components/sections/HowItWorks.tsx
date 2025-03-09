
import { FileText, Users, PieChart, ChartBar } from "lucide-react";
import Section from "../ui-custom/Section";
import Reveal from "../ui-custom/Reveal";

const steps = [
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    number: "1️⃣",
    title: "Define Your Goals",
    description: "Choose research type—focus group, concept testing, or sentiment analysis—and set your audience."
  },
  {
    icon: <Users className="h-8 w-8 text-white" />,
    number: "2️⃣",
    title: "AI Persona Interviews",
    description: "Our AI personas engage in real-time discussions, simulating market behaviors."
  },
  {
    icon: <PieChart className="h-8 w-8 text-white" />,
    number: "3️⃣",
    title: "AI-Generated Insights",
    description: "Analyze sentiment, decision drivers, and behavioral trends."
  },
  {
    icon: <ChartBar className="h-8 w-8 text-white" />,
    number: "4️⃣",
    title: "Actionable Research Reports",
    description: "Receive structured reports with visual data, key findings, and strategic recommendations."
  }
];

const HowItWorks = () => {
  return (
    <Section className="bg-primary text-white py-20 md:py-28 overflow-hidden">
      <div className="container px-4 mx-auto relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground/5 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik text-white">
              How It Works
            </h2>
          </div>
        </Reveal>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <Reveal key={index} delay={index * 100}>
              <div className="flex items-start gap-6 mb-16 last:mb-0 relative">
                {/* Step number circle */}
                <div className="relative">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                    <span className="text-2xl font-bold">{step.number}</span>
                  </div>
                  
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-full left-1/2 w-0.5 h-16 bg-white/20 -translate-x-1/2"></div>
                  )}
                </div>
                
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-medium mb-2 text-white">{step.title}</h3>
                  <p className="text-primary-foreground/90 text-left">{step.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorks;
