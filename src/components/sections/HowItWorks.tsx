
import { Target, MessageSquare, PieChart, FileText } from "lucide-react";
import Section from "../ui-custom/Section";
import Reveal from "../ui-custom/Reveal";
import { Card, CardContent } from "../ui/card";

const steps = [
  {
    icon: <Target className="h-8 w-8 text-white" />,
    number: "1",
    title: "Define Your Goals",
    description: "Choose research type—focus group, concept testing, or sentiment analysis—and set your audience."
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-white" />,
    number: "2",
    title: "AI Persona Interviews",
    description: "Create your custom personas, or select from our Public Library. Converse with them 1-on-1 or in automated research sessions."
  },
  {
    icon: <PieChart className="h-8 w-8 text-white" />,
    number: "3",
    title: "Insights Engine",
    description: "Use our automated researcher to conduct complex research quickly with groups of personas."
  },
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    number: "4",
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
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-plasmik text-white">
              How It Works
            </h2>
          </div>
        </Reveal>

        {/* Grid Layout with Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Reveal key={index} delay={index * 100}>
              <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all h-full backdrop-blur-sm">
                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                  {/* Step number and icon */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 transition-all rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-primary font-bold flex items-center justify-center">
                      {step.number}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="text-xl font-medium mb-4 text-white">{step.title}</h3>
                    <p className="text-primary-foreground/90 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorks;
