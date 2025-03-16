
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import TokenEcosystem from "@/components/sections/TokenEcosystem";
import EarnPRSNASection from "@/components/ecosystem/EarnPRSNASection";
import AvatarFeature from "@/components/ecosystem/AvatarFeature";

const EarnPRSNA = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24">
        <Section className="py-12 bg-amber-50">
          <EarnPRSNASection />
        </Section>
        
        <Section className="py-16 bg-gradient-to-b from-amber-50 to-white">
          <AvatarFeature />
        </Section>
        
        <Section className="py-16">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <TokenEcosystem />
              </Reveal>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default EarnPRSNA;
