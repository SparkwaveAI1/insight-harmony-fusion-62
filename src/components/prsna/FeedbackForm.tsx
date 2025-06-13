
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const feedbackSchema = z.object({
  walletAddress: z.string().optional(),
  feedback: z.string().min(10, "Feedback must be at least 10 characters long"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FeedbackForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      walletAddress: "",
      feedback: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user) {
      toast.error("Please sign in to submit feedback");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert feedback into database
      const { error: dbError } = await supabase
        .from('prsna_feedback')
        .insert({
          user_id: user.id,
          wallet_address: data.walletAddress || null,
          feedback: data.feedback,
        });

      if (dbError) throw dbError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-prsna-feedback', {
        body: {
          userEmail: user.email,
          walletAddress: data.walletAddress || 'Not provided',
          feedback: data.feedback,
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the entire operation if email fails
        toast.warning("Feedback saved but email notification failed");
      }

      toast.success("Thank you for your feedback! We've received it successfully.");
      form.reset();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Share Your Feedback</CardTitle>
          <CardDescription>
            Please sign in to share your thoughts about $PRSNA and PersonaAI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sign in to tell us what you think about our platform and token ecosystem.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>
          Tell us what you think about $PRSNA and PersonaAI. Your feedback helps us improve!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <FormLabel>Your Feedback *</FormLabel>
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
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
