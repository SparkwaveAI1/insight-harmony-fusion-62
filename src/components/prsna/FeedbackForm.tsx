
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  walletAddress: z.string().optional(),
  twitterId: z.string().optional(),
  feedback: z.string().min(10, "Feedback must be at least 10 characters long"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSuccess?: () => void;
}

const FeedbackForm = ({ onSuccess }: FeedbackFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  console.log("FeedbackForm - User:", user);
  
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      walletAddress: "",
      twitterId: "",
      feedback: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    console.log("Form submission started", data);
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: data.name,
        email: data.email,
        company: "",
        walletAddress: data.walletAddress || "",
        twitterId: data.twitterId || "",
        message: data.feedback,
        formType: "prsna-feedback",
      };

      console.log("Sending feedback to Supabase Edge Function...");
      console.log("Payload:", payload);
      
      const { data: result, error } = await supabase.functions.invoke('send-contact-form', {
        body: payload,
      });

      console.log("Supabase function result:", result);
      console.log("Supabase function error:", error);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Failed to send feedback: ${error.message}`);
      }

      if (result) {
        console.log("Feedback sent successfully:", result);
        setShowSuccess(true);
        form.reset();
        if (onSuccess) onSuccess();
        
        toast({
          title: "Feedback sent successfully",
          description: "Thank you for your feedback about $PRSNA and PersonaAI!",
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error sending feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return <ContactSuccess formType="prsna-feedback" />;
  }

  return (
    <div className="space-y-6">
      {!user && (
        <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please sign in to share your feedback about $PRSNA and PersonaAI.
          </p>
        </div>
      )}
      
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
            name="twitterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>X (Twitter) ID (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="@yourtwitterhandle" 
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
