
import { 
  Users, 
  LightbulbIcon, 
  TrendingUp, 
  SearchCode 
} from "lucide-react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Reveal from "../ui-custom/Reveal";

interface UseCase {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  details?: {
    title: string;
    description: string;
    example?: string;
  }[];
}

const useCases: UseCase[] = [
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Market Research & Consumer Insights",
    description: "Understand your audience through AI-powered focus groups and messaging optimization.",
    actionText: "Discover buyer personas",
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
    icon: <LightbulbIcon className="h-10 w-10 text-primary" />,
    title: "Ideation, Strategy & Planning",
    description: "Validate concepts, refine strategies, and optimize innovation with AI-driven persona feedback.",
    actionText: "Validate your concepts",
    details: [
      {
        title: "Concept Testing & Validation:",
        description: "Assess early-stage ideas, product positioning, and go-to-market strategies with AI-powered feedback loops."
      },
      {
        title: "Strategic Decision Optimization:",
        description: "Refine business models, customer acquisition approaches, and messaging frameworks through AI-driven insights."
      },
      {
        title: "Example:",
        description: "Which product positioning works better? 'AI-Powered Investing' vs. 'Data-Driven Wealth Growth'?"
      }
    ]
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-primary" />,
    title: "Long-term Consumer Intelligence",
    description: "Develop an AI persona once and leverage it for years of consistent consumer insights.",
    actionText: "Build lasting insights",
  },
  {
    icon: <SearchCode className="h-10 w-10 text-primary" />,
    title: "AI & Web3 Research",
    description: "Conduct specialized research for emerging technologies, tokens, and community ecosystems.",
    actionText: "Explore tech audiences",
  },
];

const HowToUsePersonaAI = () => {
  return (
    <Section id="how-to-use" className="bg-white">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-primary font-medium text-lg mb-2">Features</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-plasmik text-[#1d3a8a]">
              How Can You Use Persona AI?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Transform how you understand your audience with these powerful application areas
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <Reveal key={index} delay={index * 100}>
              <Card className={`h-full border-2 ${index === 0 || index === 1 ? 'border-primary/20' : 'border-slate-200'} hover:border-primary/20 transition-all`}>
                <div className="flex flex-col h-full">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      {useCase.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                      <p className="text-slate-600">{useCase.description}</p>
                    </div>
                  </div>

                  {useCase.actionText && (
                    <p className="text-primary font-medium mt-auto pt-3">
                      {useCase.actionText} →
                    </p>
                  )}

                  {(index === 0 || index === 1) && useCase.details && (
                    <div className="mt-6 border-t pt-4 border-slate-100">
                      {useCase.details.map((detail, idx) => (
                        <div key={idx} className="mb-4 last:mb-0">
                          <p className="font-medium">{detail.title}</p>
                          <p className="text-slate-600">{detail.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowToUsePersonaAI;
