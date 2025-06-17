
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  company: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  formType: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactFormProps {
  formType: "discovery" | "demo" | "contact" | "custom-persona";
  onSuccess?: () => void;
}

const ContactForm = ({ formType, onSuccess }: ContactFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
      formType: formType,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('send-contact-email', {
        body: data,
      });

      if (error) {
        console.error('Error sending contact form:', error);
        throw error;
      }

      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Your organization" {...field} />
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
              <FormLabel>Your Message</FormLabel>
              <FormControl>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={5}
                  placeholder={formType === "custom-persona" 
                    ? "Describe your target audience and research needs" 
                    : "How can we help you?"}
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
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Message
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;
