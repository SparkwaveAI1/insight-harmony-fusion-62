
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import ContactSuccess from "./ContactSuccess";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  twitterId: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  formType?: string;
  onSuccess?: () => void;
}

const ContactForm = ({ formType = "custom-persona", onSuccess }: ContactFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      twitterId: "",
      email: user?.email || "",
      company: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    console.log("Form submission started", data);
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: data.twitterId || "Anonymous",
        email: data.email || "",
        company: data.company || "",
        message: data.message,
        formType,
        walletAddress: "",
        twitterId: data.twitterId || "",
      };

      console.log("Sending contact form to Supabase Edge Function...");
      console.log("Payload:", payload);
      
      const { data: result, error } = await supabase.functions.invoke('send-contact-form', {
        body: payload,
      });

      console.log("Supabase function result:", result);
      console.log("Supabase function error:", error);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      if (result) {
        console.log("Contact form sent successfully:", result);
        setShowSuccess(true);
        form.reset();
        if (onSuccess) onSuccess();
        
        toast({
          title: "Message sent successfully",
          description: "Thank you for your interest in the Pioneer Program!",
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return <ContactSuccess formType={formType} />;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address (Optional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your company or organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your background and why you'd like to join the Pioneer Program..."
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
                Submit Application
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
