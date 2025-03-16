import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ClipboardList } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { participantOperations, questionnaireOperations } from "@/services/database/supabaseClient";
import QuestionnaireSections from "@/components/questionnaire/QuestionnaireSections";

export type QuestionnaireForm = {
  // Section 1: About You
  age: string;
  city: string;
  country: string;
  workSituation: string;
  occupation: string;
  education: string;
  livingArrangement: string;
  hasChildren: string;
  numberOfChildren?: string;
  childrenAges?: string;
  
  // Section 2: How You Spend Your Time
  freeTimeActivities: string[];
  socialFrequency: string;
  socialPreference: string;
  
  // Section 3: Opinions & Decision-Making
  decisionMakingStyle: string;
  planningStyle: string;
  jobPreference: string;
  newsFollowing: string;
  politicalDiscussions: string;
  
  // Section 4: Political & Social Perspective
  politicalEngagement: string;
  politicalViews: string;
  countrySatisfaction: string;
  
  // Section 5: Interests and Preferences
  musicTastes: string[];
  otherMusicTastes?: string;
  watchesMedia: string;
  favoriteGenres?: string;
  sportInterest: string;
  cookingInterest: string;
  
  // Section 6: Information & Media Habits
  informationSources: string[];
  trustInformation: string;
  
  // Section 7: Life Perspective Snapshot
  futureOutlook: string;
  currentFocus: string;
  noveltyPreference: string;
  travelFrequency: string;
  travelPreference?: string;
};

const PreInterviewQuestionnaire = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || "";

  const form = useForm<QuestionnaireForm>({
    defaultValues: {
      // Section 1
      age: "",
      city: "",
      country: "",
      workSituation: "",
      occupation: "",
      education: "",
      livingArrangement: "",
      hasChildren: "",
      numberOfChildren: "",
      childrenAges: "",
      
      // Section 2
      freeTimeActivities: [],
      socialFrequency: "",
      socialPreference: "",
      
      // Section 3
      decisionMakingStyle: "",
      planningStyle: "",
      jobPreference: "",
      newsFollowing: "",
      politicalDiscussions: "",
      
      // Section 4
      politicalEngagement: "",
      politicalViews: "",
      countrySatisfaction: "",
      
      // Section 5
      musicTastes: [],
      otherMusicTastes: "",
      watchesMedia: "",
      favoriteGenres: "",
      sportInterest: "",
      cookingInterest: "",
      
      // Section 6
      informationSources: [],
      trustInformation: "",
      
      // Section 7
      futureOutlook: "",
      currentFocus: "",
      noveltyPreference: "",
      travelFrequency: "",
      travelPreference: "",
    },
  });

  // Watch values for conditional rendering
  const hasChildren = form.watch("hasChildren");
  const watchesMedia = form.watch("watchesMedia");
  const travelFrequency = form.watch("travelFrequency");

  const onSubmit = async (data: QuestionnaireForm) => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email information is missing. Please start from the beginning of the process.",
        variant: "destructive",
      });
      navigate("/interview-landing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get participant by email
      const participant = await participantOperations.getParticipantByEmail(email);
      
      if (!participant) {
        throw new Error("Participant not found");
      }

      // Save questionnaire responses
      await questionnaireOperations.saveQuestionnaire(participant.id, data);

      toast({
        title: "Questionnaire Submitted",
        description: "Thank you for completing the questionnaire. You will be redirected to the interview process.",
      });

      // Navigate to interview process page
      navigate("/interview-process", { state: { email } });
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your questionnaire. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative pt-24 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Step 2: Pre-Interview Questionnaire
                </p>
              </Reveal>
              
              <Reveal delay={100}>
                <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl font-plasmik">
                  PersonaAI Pre-Interview Questionnaire
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Estimated Time: 7–10 minutes | Purpose: Help us build an accurate AI version of you for research and insights.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <Section>
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <div className="bg-card border rounded-lg p-6 md:p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <QuestionnaireSections 
                        form={form}
                        isSubmitting={isSubmitting}
                        hasChildren={hasChildren}
                        watchesMedia={watchesMedia}
                        travelFrequency={travelFrequency}
                        email={email}
                      />
                    </form>
                  </Form>
                </div>
              </Reveal>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default PreInterviewQuestionnaire;
