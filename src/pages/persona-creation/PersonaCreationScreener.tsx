
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createParticipant } from "@/services/supabase/supabaseService";

const screenerSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

type ScreenerFormValues = z.infer<typeof screenerSchema>;

const PersonaCreationScreener = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScreenerFormValues>({
    resolver: zodResolver(screenerSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ScreenerFormValues) => {
    console.log("Screener form submitted with:", values);
    setIsSubmitting(true);

    try {
      // Create a new participant in the database with this email
      const participant = await createParticipant({
        email: values.email,
        screener_passed: true,
        questionnaire_data: {},
        interview_unlocked: false,
        interview_completed: false, // This field is required
      });

      console.log("Participant created:", participant);

      if (participant && participant.id) {
        // Store the participant ID and email in session storage for future use
        console.log("Storing participant ID in session:", participant.id);
        sessionStorage.setItem("participant_id", participant.id);
        sessionStorage.setItem("participant_email", values.email);
        
        // Show success message
        toast({
          title: "Screener Completed",
          description: "Thank you! You will now proceed to the consent form.",
        });

        // Navigate to the consent form
        console.log("Navigating to consent form...");
        navigate("/persona-creation/consent");
      } else {
        throw new Error("Failed to create participant record");
      }
    } catch (error) {
      console.error("Error submitting screener:", error);
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Research Participant Screening</h1>
        <p className="text-gray-600">
          Please provide your email to begin the research participation process.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your.email@example.com" 
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>
          By proceeding, you acknowledge that you're interested in participating
          in our research study. You'll review full consent details in the next step.
        </p>
      </div>
    </div>
  );
};

export default PersonaCreationScreener;
