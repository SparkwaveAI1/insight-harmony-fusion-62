import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import PersonaV3Creator from "@/components/persona-creation/PersonaV3Creator";
import { Toaster } from "sonner";

const CreatePersonaV3 = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="bg-gradient-to-b from-[#F5F5F7] via-background to-background pt-24">
          <div className="container px-4 mx-auto py-12">
            <PersonaV3Creator />
          </div>
        </Section>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default CreatePersonaV3;