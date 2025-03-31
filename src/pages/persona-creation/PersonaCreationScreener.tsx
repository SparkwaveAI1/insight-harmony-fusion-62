
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Button from "@/components/ui-custom/Button";
import Card from "@/components/ui-custom/Card";
import Reveal from "@/components/ui-custom/Reveal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { createParticipant, getParticipantByEmail } from "@/services/supabase/supabaseService";

const formSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  age: z.string().min(1, "Please select your age"),
  gender: z.string().min(1, "Please select your gender"),
  location: z.string().min(1, "Please enter your location"),
  education: z.string().min(1, "Please select your education level"),
  employmentStatus: z.string().min(1, "Please select your employment status"),
  industry: z.string().min(1, "Please select your industry"),
  jobTitle: z.string().min(1, "Please enter your job title"),
  yearsExperience: z.string().min(1, "Please select your years of experience"),
  income: z.string().min(1, "Please select your income range"),
  children: z.string().min(1, "Please select if you have children"),
  community: z.string().min(1, "Please select your community type"),
  ethnicity: z.string().optional(),
  walletAddress: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  telegramId: z.string().optional(),
});

type ScreenerFormValues = z.infer<typeof formSchema>;

const PersonaCreationScreener = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ScreenerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      location: "",
      education: "",
      employmentStatus: "",
      industry: "",
      jobTitle: "",
      yearsExperience: "",
      income: "",
      children: "",
      community: "",
      ethnicity: "",
      walletAddress: "",
      email: "",
      phone: "",
      telegramId: "",
    },
  });

  const onSubmit = async (values: ScreenerFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (values.age === "under 18") {
        toast({
          title: "Age Requirement",
          description: "We're sorry, but participants must be 18 or older to participate in this study.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Check if participant already exists with this email
      const existingParticipant = await getParticipantByEmail(values.email);
      
      if (existingParticipant) {
        // If they exist but haven't completed the questionnaire, let them continue
        if (existingParticipant.questionnaire_data && 
            Object.keys(existingParticipant.questionnaire_data).length > 0) {
          toast({
            title: "Welcome Back",
            description: "You've already completed the screening process. Proceeding to the next step.",
          });
        } else {
          toast({
            title: "Account Found",
            description: "We found your existing account. Let's continue with the process.",
          });
        }
        
        // Store participant ID and email in session storage
        sessionStorage.setItem("participant_id", existingParticipant.id as string);
        sessionStorage.setItem("participant_email", values.email);
        
        navigate("/persona-creation/questionnaire");
        return;
      }
      
      // Create new participant
      const newParticipant = await createParticipant({
        email: values.email,
        screener_passed: true,
        questionnaire_data: values,
        interview_unlocked: false,
        interview_completed: false
      });
      
      if (newParticipant) {
        toast({
          title: "Screener Completed",
          description: "Your responses have been saved. Let's continue to the questionnaire.",
        });
        
        // Store participant ID and email in session storage
        sessionStorage.setItem("participant_id", newParticipant.id as string);
        sessionStorage.setItem("participant_email", values.email);
        
        navigate("/persona-creation/questionnaire");
      } else {
        throw new Error("Failed to create participant record");
      }
    } catch (error) {
      console.error("Error in screener submission:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your responses. Please try again.",
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
          <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <h1 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik text-center">
                  Participant Screener
                </h1>
              </Reveal>
              
              <Reveal delay={100}>
                <p className="text-lg text-muted-foreground mb-8 text-center">
                  Please complete this form to participate in our research study. Your information helps us better understand our audience.
                </p>
              </Reveal>
              
              <Reveal delay={200}>
                <Card className="p-6 md:p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name & Last Initial</FormLabel>
                            <FormDescription>e.g., Jordan S.</FormDescription>
                            <FormControl>
                              <Input placeholder="First Name & Last Initial" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="space-y-1"
                              >
                                {[
                                  { value: "under 18", label: "Under 18 (not eligible)" },
                                  { value: "18-24", label: "18–24" },
                                  { value: "25-34", label: "25–34" },
                                  { value: "35-44", label: "35–44" },
                                  { value: "45-54", label: "45–54" },
                                  { value: "55-64", label: "55–64" },
                                  { value: "65+", label: "65+" }
                                ].map((option) => (
                                  <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={option.value} />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option.label}</FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="space-y-1"
                              >
                                {[
                                  { value: "male", label: "Male" },
                                  { value: "female", label: "Female" },
                                  { value: "non-binary", label: "Non-binary / Other" },
                                  { value: "prefer not to say", label: "Prefer not to say" }
                                ].map((option) => (
                                  <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={option.value} />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option.label}</FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City, State (if applicable), Country of Residence</FormLabel>
                            <FormDescription>e.g., Austin, TX, USA</FormDescription>
                            <FormControl>
                              <Input placeholder="City, State, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Highest Level of Education Completed</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no formal education">No formal education</SelectItem>
                                <SelectItem value="some high school">Some high school</SelectItem>
                                <SelectItem value="high school">High school diploma or GED</SelectItem>
                                <SelectItem value="some college">Some college or trade school</SelectItem>
                                <SelectItem value="associate">Associate's degree</SelectItem>
                                <SelectItem value="bachelor">Bachelor's degree</SelectItem>
                                <SelectItem value="master">Master's degree</SelectItem>
                                <SelectItem value="doctorate">Doctorate or equivalent</SelectItem>
                                <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="employmentStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select employment status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full-time">Employed full-time</SelectItem>
                                <SelectItem value="part-time">Employed part-time</SelectItem>
                                <SelectItem value="self-employed">Self-employed</SelectItem>
                                <SelectItem value="unemployed-looking">Unemployed (looking for work)</SelectItem>
                                <SelectItem value="unemployed-not-looking">Unemployed (not looking)</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Industry You Work In (or Most Experience In)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="agriculture">Agriculture</SelectItem>
                                <SelectItem value="arts">Arts / Entertainment / Media</SelectItem>
                                <SelectItem value="automotive">Automotive</SelectItem>
                                <SelectItem value="biotech">Biotechnology</SelectItem>
                                <SelectItem value="construction">Construction</SelectItem>
                                <SelectItem value="consumer-goods">Consumer Goods</SelectItem>
                                <SelectItem value="design">Design (Graphic, Product, UX)</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="energy">Energy / Utilities</SelectItem>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="finance">Finance / Banking / Insurance</SelectItem>
                                <SelectItem value="food">Food & Beverage</SelectItem>
                                <SelectItem value="gaming">Gaming</SelectItem>
                                <SelectItem value="government">Government / Public Sector</SelectItem>
                                <SelectItem value="healthcare">Healthcare / Medical</SelectItem>
                                <SelectItem value="hospitality">Hospitality / Travel</SelectItem>
                                <SelectItem value="it">Information Technology / Software</SelectItem>
                                <SelectItem value="legal">Legal Services</SelectItem>
                                <SelectItem value="logistics">Logistics / Supply Chain</SelectItem>
                                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="marketing">Marketing / Advertising / PR</SelectItem>
                                <SelectItem value="nonprofit">Nonprofit / NGO</SelectItem>
                                <SelectItem value="consulting">Professional Services / Consulting</SelectItem>
                                <SelectItem value="real-estate">Real Estate</SelectItem>
                                <SelectItem value="retail">Retail / E-commerce</SelectItem>
                                <SelectItem value="sports">Sports / Recreation / Fitness</SelectItem>
                                <SelectItem value="telecom">Telecommunications</SelectItem>
                                <SelectItem value="transportation">Transportation</SelectItem>
                                <SelectItem value="web3">Web3 / Crypto</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Job Title (or most recent if not working)</FormLabel>
                            <FormControl>
                              <Input placeholder="Job Title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>How many years of experience do you have in this industry?</FormLabel>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="space-y-1"
                              >
                                {[
                                  { value: "less than 1", label: "Less than 1 year" },
                                  { value: "1-3", label: "1–3 years" },
                                  { value: "4-7", label: "4–7 years" },
                                  { value: "8-15", label: "8–15 years" },
                                  { value: "16+", label: "16+ years" }
                                ].map((option) => (
                                  <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={option.value} />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option.label}</FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Annual Household Income Range
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select income range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                                <SelectItem value="under 10k">Under $10,000</SelectItem>
                                <SelectItem value="10k-25k">$10,000–25,000</SelectItem>
                                <SelectItem value="25k-50k">$25,000–49,999</SelectItem>
                                <SelectItem value="50k-75k">$50,000–74,999</SelectItem>
                                <SelectItem value="75k-100k">$75,000–99,999</SelectItem>
                                <SelectItem value="100k-150k">$100,000–149,999</SelectItem>
                                <SelectItem value="150k-200k">$150,000–199,999</SelectItem>
                                <SelectItem value="200k+">$200,000+</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="children"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Do you have children under 18 living at home?</FormLabel>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="space-y-1"
                              >
                                {[
                                  { value: "yes", label: "Yes" },
                                  { value: "no", label: "No" },
                                  { value: "prefer not to say", label: "Prefer not to say" }
                                ].map((option) => (
                                  <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={option.value} />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option.label}</FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="community"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>What kind of community do you live in?</FormLabel>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="space-y-1"
                              >
                                {[
                                  { value: "urban", label: "Urban (City center)" },
                                  { value: "suburban", label: "Suburban" },
                                  { value: "rural", label: "Rural / Small town" }
                                ].map((option) => (
                                  <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={option.value} />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option.label}</FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ethnicity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What is your ethnicity or cultural background? <span className="text-muted-foreground">(Optional)</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Your ethnicity or cultural background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="walletAddress"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-2">
                              <FormLabel>
                                Ethereum Wallet Address <span className="text-muted-foreground">(Optional)</span>
                              </FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info size={16} className="text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Used for optional $PRSNA research rewards. This is not required to participate.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <FormControl>
                              <Input placeholder="0x..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Used for optional $PRSNA research rewards. This is not required to participate.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Are you interested in using your AI Persona for business or personal purposes? 
                              If yes, please provide your email address. <span className="text-muted-foreground">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Phone Number <span className="text-muted-foreground">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+1 (555) 555-5555" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="telegramId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Telegram ID <span className="text-muted-foreground">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="@yourtelegramid" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          variant="primary"
                          className="w-full group"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            "Processing..."
                          ) : (
                            <>
                              Next Step
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </Card>
              </Reveal>
              
              <Reveal delay={300}>
                <div className="mt-8 bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Privacy Note:</span> Your information is used solely for research purposes and will be handled according to our privacy policy.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonaCreationScreener;
