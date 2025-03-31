
import { z } from "zod";

export const formSchema = z.object({
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
    livingArrangement: z.record(z.boolean().optional()),
  }),
  decisionMaking: z.object({
    financialRisk: z.string().optional(),
    uncertainty: z.string().optional(),
    newProducts: z.string().optional(),
    style: z.string().optional(),
    trustBrands: z.string().optional(),
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

export type FormSchema = z.infer<typeof formSchema>;

// Default form values
export const defaultFormValues: FormSchema = {
  identification: { name: "", email: "" },
  dailyLife: { livingArrangement: {} },
  decisionMaking: {},
  spending: { worthItPurchases: {}, productFrustrations: {} },
  information: { newsSources: {}, contentFormats: {} },
  values: {},
  deeperInsight: {},
  background: {},
  worldview: { politicalExpression: {} },
  final: {},
};
