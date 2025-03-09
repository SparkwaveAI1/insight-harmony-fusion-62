
import React from "react";
import Section from "../ui-custom/Section";
import Reveal from "../ui-custom/Reveal";
import { MessageSquare, Search, UserPlus, Settings, ArrowRight } from "lucide-react";
import Button from "../ui-custom/Button";
import { Link } from "react-router-dom";

const subsections = [
  {
    icon: <MessageSquare className="h-10 w-10 text-primary" />,
    title: "AI Focus Groups",
    description: "Simulate qualitative research with AI personas that respond like real consumers, giving you deep insights without the traditional time and cost constraints.",
    link: "/ai-focus-groups",
    linkText: "Explore AI Focus Groups",
  },
  {
    icon: <Search className="h-10 w-10 text-primary" />,
    title: "Insights Conductor",
    description: "Extract actionable insights from your data with AI-driven analysis that identifies patterns, sentiment, and decision drivers at scale.",
    link: "/research#insights-conductor",
    linkText: "Try Insights Conductor",
  },
  {
    icon: <UserPlus className="h-10 w-10 text-primary" />,
    title: "Persona Interviewer",
    description: "Build high-fidelity AI personas through structured interviews, creating digital twins that mirror real consumer behaviors and preferences.",
    link: "/persona-ai-interviewer",
    linkText: "Use Persona Interviewer",
  },
  {
    icon: <Settings className="h-10 w-10 text-primary" />,
    title: "Research Moderator",
    description: "Guide and customize AI research sessions with precision, ensuring you get exactly the qualitative data you need for informed decisions.",
    link: "/interviewer",
    linkText: "Access Research Moderator",
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
            <p className="text-muted-foreground">
              Comprehensive AI-powered solutions for every research need
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {subsections.map((subsection, index) => (
            <Reveal key={index} delay={index * 100}>
              <div className="bg-background border rounded-xl p-6 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg inline-block">
                    {subsection.icon}
                  </div>
                  <h3 className="text-xl font-bold">{subsection.title}</h3>
                </div>
                
                <p className="text-muted-foreground mb-6 flex-grow">
                  {subsection.description}
                </p>
                
                <Link to={subsection.link} className="mt-auto">
                  <Button variant="outline" className="w-full justify-center group">
                    {subsection.linkText}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default ExplanatorySubsections;
