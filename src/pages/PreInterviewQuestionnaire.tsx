
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Check, CheckCircle, ClipboardList } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { participantOperations, questionnaireOperations } from "@/services/database/supabaseClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type QuestionnaireForm = {
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
                      {/* Section 1: About You */}
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Section 1: About You</h2>
                        <Separator />
                        
                        <FormField
                          control={form.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>How old are you?</FormLabel>
                              <FormControl>
                                <Input placeholder="Your age" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City/Town</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your city or town" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your country" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="workSituation"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>What's your current work situation?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Working full-time",
                                    "Working part-time",
                                    "Self-employed",
                                    "Not working",
                                    "Retired",
                                    "Student"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="occupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>What do you do for work (or what field are you in)?</FormLabel>
                              <FormControl>
                                <Input placeholder="Your occupation or field" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="education"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>What's your highest level of education completed?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "No formal education",
                                    "High school",
                                    "Some college",
                                    "College degree",
                                    "Graduate degree"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="livingArrangement"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Who do you live with right now?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "I live alone",
                                    "With partner/spouse",
                                    "With family (kids, parents, etc.)",
                                    "Shared housing (roommates, friends, etc.)"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasChildren"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you have children?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="Yes" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Yes</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="No" />
                                    </FormControl>
                                    <FormLabel className="font-normal">No</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {hasChildren === "Yes" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="numberOfChildren"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>How many children?</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Number of children" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="childrenAges"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Children's ages</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ages (e.g., 2, 5, 10)" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      {/* Section 2: How You Spend Your Time */}
                      <div className="space-y-6 pt-4">
                        <h2 className="text-xl font-semibold">Section 2: How You Spend Your Time</h2>
                        <Separator />
                        
                        <FormField
                          control={form.control}
                          name="freeTimeActivities"
                          render={() => (
                            <FormItem>
                              <FormLabel>What do you usually do during your free time? (Select all that apply)</FormLabel>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {[
                                  "Spend time with friends/family",
                                  "Watch TV or movies",
                                  "Play video games",
                                  "Read",
                                  "Cook or bake",
                                  "Play or follow sports",
                                  "Listen to music",
                                  "Work on hobbies or creative projects",
                                  "Other"
                                ].map((activity) => (
                                  <FormItem
                                    key={activity}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        onCheckedChange={(checked) => {
                                          const currentActivities = form.getValues("freeTimeActivities") || [];
                                          if (checked) {
                                            form.setValue("freeTimeActivities", [
                                              ...currentActivities,
                                              activity
                                            ]);
                                          } else {
                                            form.setValue(
                                              "freeTimeActivities",
                                              currentActivities.filter((a) => a !== activity)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{activity}</FormLabel>
                                  </FormItem>
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="socialFrequency"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>How often do you spend time with others socially (in person or online)?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Almost every day",
                                    "A few times a week",
                                    "A few times a month",
                                    "Rarely",
                                    "Never"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="socialPreference"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you prefer:</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Quiet time alone or with close people",
                                    "Being around groups and activity",
                                    "A mix of both"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Section 3: Opinions & Decision-Making */}
                      <div className="space-y-6 pt-4">
                        <h2 className="text-xl font-semibold">Section 3: Opinions & Decision-Making</h2>
                        <Separator />
                        
                        <FormField
                          control={form.control}
                          name="decisionMakingStyle"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>When making important decisions, you tend to:</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Think through the pros and cons carefully",
                                    "Go with your gut or feelings",
                                    "Talk it through with others first",
                                    "It depends"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="planningStyle"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Which sounds more like you?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "I like to plan things ahead of time",
                                    "I prefer to stay flexible and see what happens"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="jobPreference"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Imagine you were offered two jobs. Which would you choose?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Higher pay, but more stress and longer hours",
                                    "Lower pay, but flexible and less stressful",
                                    "Depends on details / Not sure"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="newsFollowing"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you follow news or current events?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Yes, regularly",
                                    "Occasionally",
                                    "Rarely",
                                    "Never"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="politicalDiscussions"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you enjoy discussing social or political topics?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Yes, often",
                                    "Sometimes",
                                    "Rarely",
                                    "I prefer to avoid those topics"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Section 4: Political & Social Perspective */}
                      <div className="space-y-6 pt-4">
                        <h2 className="text-xl font-semibold">Section 4: Political & Social Perspective</h2>
                        <Separator />
                        
                        <FormField
                          control={form.control}
                          name="politicalEngagement"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you consider yourself politically engaged?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Very engaged",
                                    "Somewhat engaged",
                                    "Not engaged",
                                    "Prefer not to say"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="politicalViews"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Which of these best matches your general political views?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Progressive / Left-leaning",
                                    "Moderate / In the middle",
                                    "Conservative / Right-leaning",
                                    "I don't think in political terms",
                                    "Other / Not sure"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="countrySatisfaction"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>In your country, how satisfied are you with the direction things are going overall?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Very satisfied",
                                    "Somewhat satisfied",
                                    "Somewhat dissatisfied",
                                    "Very dissatisfied",
                                    "I don't have strong feelings"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Section 5: Interests and Preferences */}
                      <div className="space-y-6 pt-4">
                        <h2 className="text-xl font-semibold">Section 5: Interests and Preferences</h2>
                        <Separator />
                        
                        <FormField
                          control={form.control}
                          name="musicTastes"
                          render={() => (
                            <FormItem>
                              <FormLabel>What types of music do you enjoy? (Select all that apply)</FormLabel>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {[
                                  "Pop",
                                  "Rock",
                                  "Hip-Hop/Rap",
                                  "Classical",
                                  "Jazz",
                                  "Country",
                                  "Electronic",
                                  "I don't really listen to music",
                                  "Other"
                                ].map((genre) => (
                                  <FormItem
                                    key={genre}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        onCheckedChange={(checked) => {
                                          const currentGenres = form.getValues("musicTastes") || [];
                                          if (checked) {
                                            form.setValue("musicTastes", [
                                              ...currentGenres,
                                              genre
                                            ]);
                                          } else {
                                            form.setValue(
                                              "musicTastes",
                                              currentGenres.filter((g) => g !== genre)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{genre}</FormLabel>
                                  </FormItem>
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />

                        {form.watch("musicTastes")?.includes("Other") && (
                          <FormField
                            control={form.control}
                            name="otherMusicTastes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Please specify other music genres:</FormLabel>
                                <FormControl>
                                  <Input placeholder="Other music genres you enjoy" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="watchesMedia"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you watch TV shows or movies regularly?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="Yes" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Yes</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="No" />
                                    </FormControl>
                                    <FormLabel className="font-normal">No</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {watchesMedia === "Yes" && (
                          <FormField
                            control={form.control}
                            name="favoriteGenres"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Favorite types or genres:</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your favorite genres" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="sportInterest"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you follow or play sports?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Yes, follow as a fan",
                                    "Yes, I play",
                                    "Both",
                                    "Not really interested in sports"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cookingInterest"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you enjoy cooking or baking?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Yes, I enjoy it",
                                    "Sometimes",
                                    "Not really"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Section 6: Information & Media Habits */}
                      <div className="space-y-6 pt-4">
                        <h2 className="text-xl font-semibold">Section 6: Information & Media Habits</h2>
                        <Separator />
                        
                        <FormField
                          control={form.control}
                          name="informationSources"
                          render={() => (
                            <FormItem>
                              <FormLabel>Where do you usually get information about news or topics you care about? (Select all that apply)</FormLabel>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {[
                                  "Television",
                                  "Newspapers or magazines",
                                  "News websites (e.g., BBC, CNN, local news, etc.)",
                                  "Social media (e.g., Facebook, Twitter, TikTok)",
                                  "YouTube or podcasts",
                                  "Friends or family",
                                  "I don't follow news or information sources regularly"
                                ].map((source) => (
                                  <FormItem
                                    key={source}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        onCheckedChange={(checked) => {
                                          const currentSources = form.getValues("informationSources") || [];
                                          if (checked) {
                                            form.setValue("informationSources", [
                                              ...currentSources,
                                              source
                                            ]);
                                          } else {
                                            form.setValue(
                                              "informationSources",
                                              currentSources.filter((s) => s !== source)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{source}</FormLabel>
                                  </FormItem>
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="trustInformation"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you trust most information you come across online?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Yes, most of it",
                                    "I'm cautious and double-check things",
                                    "I rarely trust online information",
                                    "I don't think about it much"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Section 7: Life Perspective Snapshot */}
                      <div className="space-y-6 pt-4">
                        <h2 className="text-xl font-semibold">Section 7: Life Perspective Snapshot</h2>
                        <Separator />
                        
                        <FormField
                          control={form.control}
                          name="futureOutlook"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>How do you feel about the future?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Mostly optimistic",
                                    "A mix of hope and concern",
                                    "Mostly pessimistic",
                                    "I don't think about it much"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentFocus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Describe one thing that's important to you right now, or that you're focused on.</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Share what's important to you..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="noveltyPreference"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you usually try new things, or stick with what you know?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "I enjoy trying new things",
                                    "I stick with what I know",
                                    "Depends on the situation"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="travelFrequency"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Do you travel for leisure?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {[
                                    "Yes, regularly",
                                    "Occasionally",
                                    "Rarely",
                                    "Never"
                                  ].map((option) => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {travelFrequency && travelFrequency !== "Never" && (
                          <FormField
                            control={form.control}
                            name="travelPreference"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>(If you travel) How do you usually choose where to go?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    {[
                                      "I look for new and exciting places",
                                      "I return to familiar spots",
                                      "I decide based on deals or affordability",
                                      "Other / It depends"
                                    ].map((option) => (
                                      <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value={option} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{option}</FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      <div className="pt-6">
                        <p className="text-center text-muted-foreground mb-8">
                          This helps us build a realistic, thoughtful AI version of you for research purposes. 
                          The next step is a guided interview—focused on your experiences, insights, and unique perspective.
                        </p>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            size="lg" 
                            className="group"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>Submitting...</>
                            ) : (
                              <>
                                Submit Questionnaire
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
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
