
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  walletAddress: z.string().optional(),
  feedback: z.string().min(10, "Feedback must be at least 10 characters long"),
  formType: z.string(),
  _subject: z.string(),
  _replyTo: z.string(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSuccess?: () => void;
}

const FeedbackForm = ({ onSuccess }: FeedbackFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      walletAddress: "",
      feedback: "",
      formType: "prsna-feedback",
      _subject: "New $PRSNA Feedback - PersonaAI",
      _replyTo: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    data._replyTo = data.email;
    
    try {
      const response = await fetch("https://formspree.io/f/xwplpoyz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          recipient: "scott@sparkwave-ai.com",
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          Please sign in to share your feedback about $PRSNA and PersonaAI.
        </p>
      </div>
    );
  }

  if (showSuccess) {
    return <ContactSuccess formType="prsna-feedback" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
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

        {/* Hidden fields for Formspree */}
        <input type="hidden" name="formType" value="prsna-feedback" />
        <input type="hidden" name="_subject" value="New $PRSNA Feedback - PersonaAI" />
        
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
  );
};

export default FeedbackForm;
