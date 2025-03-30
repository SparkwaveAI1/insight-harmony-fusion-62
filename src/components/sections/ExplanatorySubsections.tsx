
import React from "react";
import Section from "../ui-custom/Section";
import Reveal from "../ui-custom/Reveal";
import { MessageSquare, Search, UserPlus, Settings } from "lucide-react";

const subsections = [
  {
    icon: <MessageSquare className="h-10 w-10 text-primary" />,
    title: "AI Focus Groups",
    description: "Simulate qualitative research with AI personas that respond like real consumers, giving you deep insights without the traditional time and cost constraints.",
    featured: false
  },
  {
    icon: <Search className="h-10 w-10 text-primary" />,
    title: "Insights Conductor",
    description: "Extract actionable insights from your data with AI-driven analysis that identifies patterns, sentiment, and decision drivers at scale.",
    featured: false
  },
  {
    icon: <UserPlus className="h-10 w-10 text-primary" />,
    title: "Persona Interviewer",
    description: "Build high-fidelity AI personas through structured interviews, creating digital twins that mirror real consumer behaviors and preferences.",
    featured: false
  },
  {
    icon: <Settings className="h-10 w-10 text-primary" />,
    title: "Research Moderator",
    description: "Guide and customize AI research sessions with precision, ensuring you get exactly the qualitative data you need for informed decisions.",
    featured: false
  },
];

const ExplanatorySubsections = () => {
  return (
    <Section className="py-20 bg-[#D3E4FD]">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik">
              Our Research Toolkit
            </h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive AI-powered solutions for every research need
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {subsections.map((subsection, index) => (
            <Reveal key={index} delay={index * 100}>
              <div className="bg-background border rounded-xl p-8 h-full flex flex-col transition-all hover:shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary/10 rounded-lg inline-block">
                    {subsection.icon}
                  </div>
                  <h3 className="text-2xl font-bold">{subsection.title}</h3>
                </div>
                
                <p className="text-muted-foreground mb-8 flex-grow text-lg">
                  {subsection.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default ExplanatorySubsections;
