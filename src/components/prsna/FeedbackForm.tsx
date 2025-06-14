
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import ContactSuccess from "@/components/contact/ContactSuccess";
import { Send, Loader2 } from "lucide-react";

const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  walletAddress: z.string().optional(),
  feedback: z.string().min(10, "Feedback must be at least 10 characters long"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSuccess?: () => void;
}

const FeedbackForm = ({ onSuccess }: FeedbackFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  console.log("FeedbackForm - User:", user);
  
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      walletAddress: "",
      feedback: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    console.log("Form submission started", data);
    setIsSubmitting(true);
    
    try {
      const formData = {
        ...data,
        _subject: "New $PRSNA Feedback - PersonaAI",
        _replyTo: data.email,
        formType: "prsna-feedback",
        userEmail: user?.email || data.email,
      };

      console.log("Sending to Formspree:", formData);

      const response = await fetch("https://formspree.io/f/xwplpoyz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Formspree response:", response.status, response.ok);

      if (response.ok) {
        setShowSuccess(true);
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        const errorText = await response.text();
        console.error("Form submission failed:", errorText);
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return <ContactSuccess formType="prsna-feedback" />;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} />
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
                <FormLabel>Wallet Address (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="0x..." 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="feedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Feedback</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Share your thoughts about $PRSNA, PersonaAI, or suggestions for improvement..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default FeedbackForm;
