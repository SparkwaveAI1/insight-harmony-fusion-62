
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Copy, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Persona, InterviewSection, InterviewQuestion } from "@/services/persona/types";
import { clonePersona } from "@/services/persona/personaService";

// Define the form schema for the basic persona info
const cloneFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  customization_notes: z.string().optional(),
});

type CloneFormValues = z.infer<typeof cloneFormSchema>;

interface PersonaCloneFormProps {
  persona: Persona;
}

const PersonaCloneForm = ({ persona }: PersonaCloneFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewSections, setInterviewSections] = useState<InterviewSection[]>(
    getInitialInterviewSections(persona)
  );
  const navigate = useNavigate();

  // Initialize form with current persona data
  const form = useForm<CloneFormValues>({
    resolver: zodResolver(cloneFormSchema),
    defaultValues: {
      name: `${persona.name} (Clone)`,
      prompt: persona.prompt || "",
      customization_notes: "",
    },
  });

  function getInitialInterviewSections(persona: Persona): InterviewSection[] {
    let sections: InterviewSection[] = [];
    
    if (Array.isArray(persona.interview_sections)) {
      sections = [...persona.interview_sections];
    } else if (persona.interview_sections && 'interview_sections' in persona.interview_sections) {
      sections = [...(persona.interview_sections.interview_sections || [])];
    }
    
    // Make sure each section has proper question objects
    return sections.map(section => ({
      ...section,
      questions: Array.isArray(section.questions) 
        ? section.questions.map(q => 
            typeof q === 'string' 
              ? { question: q, response: "" } 
              : { ...q }
          )
        : []
    }));
  }

  const handleTraitChange = (
    category: string,
    trait: string,
    value: number | string
  ) => {
    // Create a deep copy of the persona to modify
    const personaCopy = JSON.parse(JSON.stringify(persona));
    
    // Update the trait value
    if (category === "big_five" || 
        category === "moral_foundations" || 
        category === "world_values" ||
        category === "political_compass" ||
        category === "behavioral_economics" ||
        category === "extended_traits") {
      if (personaCopy.trait_profile && personaCopy.trait_profile[category]) {
        personaCopy.trait_profile[category][trait] = value;
      }
    }
    
    // We'll use this updated persona when cloning
    setPersona(personaCopy);
  };

  const updateInterviewQuestion = (
    sectionIndex: number,
    questionIndex: number,
    newQuestion: string
  ) => {
    const updatedSections = [...interviewSections];
    const questionObj = updatedSections[sectionIndex].questions[questionIndex];
    
    if (typeof questionObj === 'object') {
      questionObj.question = newQuestion;
      setInterviewSections(updatedSections);
    }
  };

  const addQuestion = (sectionIndex: number) => {
    const updatedSections = [...interviewSections];
    updatedSections[sectionIndex].questions.push({
      question: "New question",
      response: ""
    });
    setInterviewSections(updatedSections);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...interviewSections];
    updatedSections[sectionIndex].questions.splice(questionIndex, 1);
    setInterviewSections(updatedSections);
  };

  const setPersona = (updatedPersona: Persona) => {
    // This function updates our working persona copy
    persona = updatedPersona;
  };

  const onSubmit = async (data: CloneFormValues) => {
    setIsSubmitting(true);
    try {
      // Create a modified persona with user customizations
      const customizedPersona: Persona = {
        ...persona,
        name: data.name,
        prompt: data.prompt,
        interview_sections: interviewSections,
        // Reset the persona_id and creation_date for the clone
        persona_id: "", // Will be generated on the server
        creation_date: new Date().toISOString().split('T')[0],
      };

      // Append customization notes to the prompt if provided
      if (data.customization_notes) {
        customizedPersona.prompt = `${customizedPersona.prompt}\n\nCustomization Notes: ${data.customization_notes}`;
      }

      // Save the cloned persona
      const clonedPersona = await clonePersona(customizedPersona);
      
      if (clonedPersona) {
        toast.success("Persona cloned successfully!");
        setOpen(false);
        // Navigate to the new persona detail page
        navigate(`/persona/${clonedPersona.persona_id}`);
      } else {
        toast.error("Failed to clone persona");
      }
    } catch (error) {
      console.error("Error cloning persona:", error);
      toast.error("An error occurred while cloning the persona");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTraitSliders = () => {
    const traitCategories = [
      {
        name: "big_five",
        title: "Big Five Personality Traits",
        traits: persona.trait_profile?.big_five || {}
      },
      {
        name: "moral_foundations",
        title: "Moral Foundations",
        traits: persona.trait_profile?.moral_foundations || {}
      },
      {
        name: "world_values",
        title: "World Values",
        traits: persona.trait_profile?.world_values || {}
      },
      {
        name: "political_compass",
        title: "Political Compass",
        traits: persona.trait_profile?.political_compass || {}
      },
      {
        name: "behavioral_economics",
        title: "Behavioral Economics",
        traits: persona.trait_profile?.behavioral_economics || {}
      },
    ];

    return (
      <Accordion type="single" collapsible className="w-full">
        {traitCategories.map((category, idx) => (
          <AccordionItem key={idx} value={category.name}>
            <AccordionTrigger className="text-md font-medium">
              {category.title}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                {Object.entries(category.traits).map(([trait, value]) => {
                  // Skip null or undefined values
                  if (value === null || value === undefined) return null;
                  
                  // Try to parse trait value to number if it's stored as string
                  const numericValue = typeof value === 'string' ? 
                    parseFloat(value) : 
                    typeof value === 'number' ? value : 0;
                  
                  // Only render traits with valid values
                  if (isNaN(numericValue)) return null;
                  
                  const traitLabel = trait.replace(/_/g, ' ');
                  
                  return (
                    <div key={trait} className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium capitalize">
                          {traitLabel}
                        </label>
                        <span className="text-sm text-muted-foreground">
                          {numericValue.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[numericValue]}
                        min={0}
                        max={10}
                        step={0.1}
                        onValueChange={(values) => {
                          handleTraitChange(category.name, trait, values[0]);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Clone & Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Clone & Customize Persona</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name for the cloned persona" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Prompt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Original persona generation prompt" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This is the original prompt used to generate this persona.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customization_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customization Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Make this persona more funny, more prone to anger, or more politically aligned with..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Add specific instructions on how to modify this persona.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personality Traits</h3>
              <p className="text-sm text-muted-foreground">
                Adjust the sliders to modify personality traits of the cloned persona.
              </p>
              
              {renderTraitSliders()}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Interview Questions</h3>
              <p className="text-sm text-muted-foreground">
                Edit, add or remove interview questions for this persona.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                {interviewSections.map((section, sectionIndex) => (
                  <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                    <AccordionTrigger className="text-md font-medium">
                      {section.section || `Section ${sectionIndex + 1}`}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {section.questions.map((q, questionIndex) => {
                          const questionText = typeof q === 'string' ? q : q.question;
                          
                          return (
                            <div key={questionIndex} className="flex items-start space-x-2">
                              <Input
                                value={questionText}
                                onChange={(e) => updateInterviewQuestion(sectionIndex, questionIndex, e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeQuestion(sectionIndex, questionIndex)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestion(sectionIndex)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Question
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Clone"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonaCloneForm;
