
import { Users, Flag, TrendingUp, Search } from "lucide-react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Reveal from "../ui-custom/Reveal";

interface UseCase {
  icon: React.ReactNode;
  title: string;
  description?: string;
  details?: {
    title: string;
    description: string;
    example?: string;
  }[];
}

const useCases: UseCase[] = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Traditional Market Research & Consumer Insights",
    details: [
      {
        title: "AI-Powered Focus Groups:",
        description: "Scalable qualitative discussions to test product-market fit."
      },
      {
        title: "Brand Messaging Optimization:",
        description: "A/B test ad copy, pricing models, and branding with AI-driven feedback."
      },
      {
        title: "Example:",
        description: "Which messaging resonates better with Gen Z—'Sustainable Investing' or 'AI-Powered Portfolio Growth'?"
      }
    ]
  },
  {
    icon: <Flag className="h-8 w-8 text-primary" />,
    title: "Ideation, Strategy, & Planning"
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Develop an AI persona once—use it for years."
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: "AI & Web3 Token Research; Community & Ecosystem Growth"
  },
];

const HowToUsePersonaAI = () => {
  return (
    <Section id="how-to-use" className="bg-white">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-primary text-lg mb-2">Features</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-plasmik text-[#1d3a8a]">
              How Can You Use Persona AI?
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <Reveal key={index} delay={index * 100}>
                <Card className={`relative overflow-hidden border-2 ${index === 0 ? 'border-primary/20' : 'border-slate-200'} hover:border-primary/20 transition-all`}>
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl h-fit">
                      {useCase.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-2">{useCase.title}</h3>
                      {useCase.description && <p className="text-muted-foreground">{useCase.description}</p>}
                    </div>
                  </div>

                  {index === 0 && useCase.details && (
                    <div className="mt-6 border-t pt-4 border-slate-100">
                      {useCase.details.map((detail, idx) => (
                        <div key={idx} className="mb-4 last:mb-0">
                          <p className="font-medium">{detail.title}</p>
                          <p className="text-slate-600">{detail.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default HowToUsePersonaAI;
