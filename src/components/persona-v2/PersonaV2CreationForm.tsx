import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import {
  identitySchema,
  lifeContextSchema,
  cognitiveProfileSchema,
  socialCognitionSchema,
  healthProfileSchema,
  defaultPersonaV2Values,
} from "@/schemas/personaV2Schema";
import { usePersonaV2 } from "@/hooks/usePersonaV2";
import { PersonaV2 } from "@/types/persona-v2";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

import IdentityForm from "./forms/IdentityForm";
import LifeContextForm from "./forms/LifeContextForm";
import CognitiveProfileForm from "./forms/CognitiveProfileForm";
import SocialCognitionForm from "./forms/SocialCognitionForm";
import HealthProfileForm from "./forms/HealthProfileForm";

const steps = [
  { title: "Identity", component: IdentityForm, schema: identitySchema },
  { title: "Life Context", component: LifeContextForm, schema: lifeContextSchema },
  { title: "Cognitive Profile", component: CognitiveProfileForm, schema: cognitiveProfileSchema },
  { title: "Social Cognition", component: SocialCognitionForm, schema: socialCognitionSchema },
  { title: "Health Profile", component: HealthProfileForm, schema: healthProfileSchema },
];

const PersonaV2CreationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { createPersona } = usePersonaV2();

  const methods = useForm({
    resolver: zodResolver(steps[currentStep].schema),
    defaultValues: defaultPersonaV2Values,
    mode: "onChange",
  });

  const { handleSubmit, trigger, formState: { isValid } } = methods;

  const nextStep = async () => {
    const isStepValid = await trigger();
    if (isStepValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createFullPersonaV2 = (formData: any): PersonaV2 => {
    const now = new Date().toISOString();
    const personaId = uuidv4();

    return {
      id: personaId,
      version: "2.1",
      created_at: now,
      persona_type: "simulated",
      locale: "en-US",
      ...formData,
      // Auto-generate simplified versions of complex sections
      sexuality_profile: {
        orientation: formData.sexuality_profile?.orientation || "heterosexual",
        identity_labels: [],
        expression: "private",
        libido_level: "medium",
        relationship_norms: "monogamous",
        flirtatiousness: "low",
        privacy_preference: formData.sexuality_profile?.privacy_preference || "selective",
        importance_in_identity: 0.3,
        value_alignment: "pragmatic",
        boundaries: {
          topics_off_limits: [],
          consent_language_preferences: [],
        },
        contradictions: [],
        hooks: {
          linguistic_influences: {
            register_bias: "no_change",
            humor_style_bias: "none",
            taboo_navigation: "euphemistic",
          },
          reasoning_influences: {
            jealousy_sensitivity: 0.5,
            commitment_weight: 0.5,
            status_mating_bias: 0.3,
          },
          group_behavior_influences: {
            attention_to_attraction_cues: "medium",
            self_disclosure_rate: "medium",
            boundary_enforcement: "firm",
          },
        },
      },
      knowledge_profile: {
        domains_of_expertise: formData.knowledge_profile?.domains_of_expertise || [],
        general_knowledge_level: formData.knowledge_profile?.general_knowledge_level || "average",
        tech_literacy: formData.knowledge_profile?.tech_literacy || "medium",
        cultural_familiarity: [],
      },
      emotional_triggers: {
        positive: formData.emotional_triggers?.positive || [],
        negative: formData.emotional_triggers?.negative || [],
        explosive: [],
      },
      contradictions: [],
      memory: {
        short_term_slots: 7,
        long_term_events: [],
        persistence: { short_term: 0.7, long_term: 0.9 },
      },
      state_modifiers: {
        current_state: {
          fatigue: 0.3,
          acute_stress: 0.2,
          mood_valence: 0.6,
          time_pressure: 0.3,
          social_safety: 0.7,
          sexual_tension: 0.1,
        },
        state_to_shift_rules: [],
      },
      linguistic_style: {
        base_voice: {
          formality: "neutral",
          directness: "balanced",
          politeness: "medium",
          verbosity: "moderate",
          code_switching: "mild",
          register_examples: [],
        },
        lexical_preferences: {
          affect_words: { positive_bias: 0.5, negative_bias: 0.3 },
          intensifiers: [],
          hedges: [],
          modal_verbs: [],
          domain_jargon: [],
          taboo_language: "euphemize",
          flirt_markers: [],
        },
        syntax_and_rhythm: {
          avg_sentence_tokens: { baseline_min: 8, baseline_max: 20 },
          complexity: "compound",
          lists_frequency_per_200_tokens: 0.3,
          disfluencies: [],
          signature_phrases: [],
        },
        response_shapes_by_intent: {
          opinion: [],
          critique: [],
          advice: [],
          story: [],
        },
        anti_mode_collapse: {
          forbidden_frames: [],
          must_include_one_of: {},
          signature_phrase_frequency_max: 0.1,
        },
      },
      trait_to_language_map: {
        rules: [],
        moral_and_values_rules: [],
        sexuality_rules: [],
      },
      group_behavior: {
        focus_group_modifiers: {
          assertiveness: "medium",
          interruption_tolerance: "medium",
          deference_to_authority: "medium",
          speak_first_probability: 0.3,
          self_disclosure_rate: "medium",
          boundary_enforcement: "firm",
          accommodation_rules: [],
        },
      },
      reasoning_modifiers: {
        baseline: {
          structure_level: 0.5,
          verification_depth: 0.5,
          analogy_usage: 0.3,
          risk_tolerance: 0.5,
          confidence_calibration: "well",
          exploration_vs_exploitation: "balanced",
          hallucination_aversion: 0.7,
        },
        domain_biases: [],
      },
      runtime_controls: {
        style_weights: { cognition: 0.3, linguistics: 0.3, knowledge: 0.2, memory_contradiction: 0.2 },
        variability_profile: { turn_to_turn: 0.1, session_to_session: 0.2, mood_shift_probability: 0.1 },
        brevity_policy: {
          default_max_paragraphs: 3,
          intent_overrides: {},
        },
        token_budgets: { min: 50, max: 300 },
        postprocessors: ["brevity", "style_enforcement", "privacy_filter"],
      },
      ethics_and_safety: {
        refusals: [],
        escalation_phrases: [],
        sensitive_topics_style: "respectful",
      },
      telemetry: {
        log_fields: ["response_length", "signature_usage", "mood_indicators"],
        target_fidelity: { min_signature_usage_rate: 0.1, max_generic_frame_rate: 0.3 },
      },
    };
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const fullPersona = createFullPersonaV2(data);
      const newPersona = await createPersona({
        persona_id: fullPersona.id,
        name: fullPersona.identity.name,
        description: fullPersona.life_context.background_narrative,
        persona_data: fullPersona,
        persona_type: "simulated",
        is_public: false,
      });

      if (newPersona) {
        toast.success("Persona created successfully!");
        navigate(`/persona-detail/${fullPersona.id}`);
      }
    } catch (error) {
      console.error("Error creating persona:", error);
      toast.error("Failed to create persona. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Create New Persona</h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <CurrentStepComponent />

            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isValid}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Persona"}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
};

export default PersonaV2CreationForm;