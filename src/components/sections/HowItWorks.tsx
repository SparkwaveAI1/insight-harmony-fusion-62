
import { FileText, Users, PieChart, ChartBar } from "lucide-react";
import Section from "../ui-custom/Section";
import Reveal from "../ui-custom/Reveal";

const steps = [
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    title: "Define Your Research Goals",
    description: "Select the type of research you need—focus group, concept testing, or sentiment analysis—and specify your target audience."
  },
  {
    icon: <Users className="h-8 w-8 text-white" />,
    title: "AI-Driven Persona Interviews",
    description: "Our AI personas engage in discussions, answer questions, and simulate market behaviors relevant to your study."
  },
  {
    icon: <PieChart className="h-8 w-8 text-white" />,
    title: "AI-Generated Insights & Analysis",
    description: "PersonaAI analyzes the interactions to provide insights into sentiment shifts, decision-making drivers, and behavioral patterns."
  },
  {
    icon: <ChartBar className="h-8 w-8 text-white" />,
    title: "Actionable Research Reports",
    description: "Receive comprehensive reports with visualized data, key findings, and strategic recommendations for your business decisions."
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
            <p className="text-primary-foreground/90 text-pretty max-w-2xl mx-auto">
              Our streamlined process makes qualitative research faster, more accurate, and more insightful than traditional methods.
            </p>
          </div>
        </Reveal>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <Reveal key={index} delay={index * 100}>
              <div className="flex items-start gap-6 mb-16 last:mb-0 relative">
                {/* Step number circle */}
                <div className="relative">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                    {step.icon}
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
