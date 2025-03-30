
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Import section components
import IdentificationSection from "@/components/persona-creation/questionnaire/IdentificationSection";
import DailyLifeSection from "@/components/persona-creation/questionnaire/DailyLifeSection";
import DecisionMakingSection from "@/components/persona-creation/questionnaire/DecisionMakingSection";
import SpendingSection from "@/components/persona-creation/questionnaire/SpendingSection";
import InformationSection from "@/components/persona-creation/questionnaire/InformationSection";
import ValuesSection from "@/components/persona-creation/questionnaire/ValuesSection";
import DeeperInsightSection from "@/components/persona-creation/questionnaire/DeeperInsightSection";
import WorldviewSection from "@/components/persona-creation/questionnaire/WorldviewSection";
import BackgroundSection from "@/components/persona-creation/questionnaire/BackgroundSection";
import FinalSection from "@/components/persona-creation/questionnaire/FinalSection";

const formSchema = z.object({
  identification: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Valid email is required" }),
  }),
  dailyLife: z.object({
    dayStructure: z.string().optional(),
    weekPlanning: z.string().optional(),
    location: z.string().optional(),
    workHours: z.string().optional(),
    caregiving: z.string().optional(),
    livingArrangement: z.string().optional(),
  }),
  decisionMaking: z.object({
    financialRisk: z.string().optional(),
    uncertainty: z.string().optional(),
    newProducts: z.string().optional(),
    style: z.string().optional(),
    trustBrands: z.string().optional(),
    trustFactor: z.string().optional(),
  }),
  spending: z.object({
    moneyThoughts: z.string().optional(),
    worthItPurchases: z.record(z.boolean().optional()),
    impulseBuy: z.string().optional(),
    noRegretPurchase: z.string().optional(),
    productFrustrations: z.object({
      pricing: z.boolean().optional(),
      onboarding: z.boolean().optional(),
      support: z.boolean().optional(),
      bugs: z.boolean().optional(),
      ui: z.boolean().optional(),
      marketing: z.boolean().optional(),
      transparency: z.boolean().optional(),
      other: z.boolean().optional(),
      otherText: z.string().optional(),
    }),
  }),
  information: z.object({
    newsSources: z.record(z.boolean().optional()),
    contentFormats: z.record(z.boolean().optional()),
    contentTime: z.string().optional(),
    followInfluencers: z.string().optional(),
    trustForAdvice: z.string().optional(),
  }),
  values: z.object({
    successDefinition: z.string().optional(),
    improveLifeArea: z.string().optional(),
    worldview: z.string().optional(),
    identityTiedToWork: z.string().optional(),
    workVsHome: z.string().optional(),
  }),
  deeperInsight: z.object({
    decisionConfidence: z.string().optional(),
    noveltyPreference: z.string().optional(),
    learningStyle: z.string().optional(),
    mindChange: z.string().optional(),
    groupBehavior: z.string().optional(),
    stressReaction: z.string().optional(),
    opinionSharing: z.string().optional(),
    friendsDescription: z.string().optional(),
    industryUnderstanding: z.string().optional(),
    misunderstanding: z.string().optional(),
  }),
  background: z.object({
    disability: z.string().optional(),
    healthImpact: z.string().optional(),
    mentalHealth: z.string().optional(),
    mentalHealthInfluence: z.string().optional(),
    bornInCurrentCountry: z.string().optional(),
    multipleCultures: z.string().optional(),
    immigrationExperience: z.string().optional(),
    financialBackground: z.string().optional(), 
    backgroundInfluence: z.string().optional(),
    lgbtqia: z.string().optional(),
    identityImpact: z.string().optional(),
    discrimination: z.string().optional(),
    invisibilityContext: z.string().optional(),
  }),
  worldview: z.object({
    politicalWorldview: z.string().optional(),
    politicalWorldviewOther: z.string().optional(),
    politicalRelation: z.string().optional(),
    trustInstitutions: z.string().optional(),
    politicalExpression: z.record(z.boolean().optional()),
    politicalStance: z.string().optional(),
    politicalStanceOther: z.string().optional(),
    politicalRepresentation: z.string().optional(),
  }),
  final: z.object({
    additionalInfo: z.string().optional(),
    openToFollowups: z.string().optional(),
    telegramContact: z.string().optional(),
  }),
});

type FormSchema = z.infer<typeof formSchema>;

const PersonaCreationQuestionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState<string>("identification");

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identification: { name: "", email: "" },
      dailyLife: {},
      decisionMaking: {},
      spending: { worthItPurchases: {}, productFrustrations: {} },
      information: { newsSources: {}, contentFormats: {} },
      values: {},
      deeperInsight: {},
      background: {},
      worldview: { politicalExpression: {} },
      final: {},
    },
  });

  const onSubmit = (data: FormSchema) => {
    console.log("Form submitted:", data);
    toast({
      title: "Questionnaire Completed",
      description: "Thank you for completing the questionnaire!",
    });
    
    // In a real app, you'd save this data to your backend
    // and then navigate to the next step
    navigate("/persona-creation/consent");
  };

  const sections = [
    { id: "identification", label: "Identification" },
    { id: "dailyLife", label: "Daily Life" },
    { id: "decisionMaking", label: "Decision Making" },
    { id: "spending", label: "Spending" },
    { id: "information", label: "Information" },
    { id: "values", label: "Values" },
    { id: "deeperInsight", label: "Deeper Insight" },
    { id: "background", label: "Background" },
    { id: "worldview", label: "Worldview" },
    { id: "final", label: "Final" },
  ];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">✅ Persona Pre-Interview Questionnaire</h1>
        <p className="text-gray-600 mb-2"><strong>Estimated time:</strong> 15–20 minutes</p>
        <p className="text-gray-600 mb-2"><strong>Format:</strong> Mostly multiple choice + a few short fill-ins</p>
        <p className="text-gray-600">
          <strong>Purpose:</strong> Capture foundational data to build deep, behaviorally accurate AI personas
        </p>
      </div>

      <div className="mb-8 bg-muted/30 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-3">Progress</h2>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section components */}
          <IdentificationSection 
            form={form} 
            open={activeSection === "identification"}
            onOpenChange={(open) => open && setActiveSection("identification")} 
          />
          
          <DailyLifeSection 
            form={form} 
            open={activeSection === "dailyLife"}
            onOpenChange={(open) => open && setActiveSection("dailyLife")}
          />
          
          <DecisionMakingSection 
            form={form} 
            open={activeSection === "decisionMaking"}
            onOpenChange={(open) => open && setActiveSection("decisionMaking")} 
          />
          
          <SpendingSection 
            form={form}
            open={activeSection === "spending"}
            onOpenChange={(open) => open && setActiveSection("spending")}
          />
          
          <InformationSection 
            form={form}
            open={activeSection === "information"} 
            onOpenChange={(open) => open && setActiveSection("information")}
          />
          
          <ValuesSection 
            form={form}
            open={activeSection === "values"}
            onOpenChange={(open) => open && setActiveSection("values")} 
          />
          
          <DeeperInsightSection 
            form={form}
            open={activeSection === "deeperInsight"} 
            onOpenChange={(open) => open && setActiveSection("deeperInsight")}
          />
          
          <BackgroundSection 
            form={form}
            open={activeSection === "background"} 
            onOpenChange={(open) => open && setActiveSection("background")}
          />
          
          <WorldviewSection 
            form={form}
            open={activeSection === "worldview"}
            onOpenChange={(open) => open && setActiveSection("worldview")} 
          />
          
          <FinalSection 
            form={form}
            open={activeSection === "final"} 
            onOpenChange={(open) => open && setActiveSection("final")}
          />

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/persona-creation/screener")}
            >
              Back
            </Button>
            <Button type="submit">Complete Questionnaire</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonaCreationQuestionnaire;
