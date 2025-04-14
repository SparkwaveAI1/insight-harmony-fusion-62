
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import PersonaOption from "./PersonaOption";
import ResearchOption from "./ResearchOption";

const OptionsSection = () => {
  return (
    <Section>
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Reveal>
            <PersonaOption />
          </Reveal>
          <Reveal delay={200}>
            <ResearchOption />
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default OptionsSection;
