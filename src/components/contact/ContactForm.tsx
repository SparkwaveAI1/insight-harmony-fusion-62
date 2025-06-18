
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

// Create dynamic schema based on form type
const createFormSchema = (formType: string) => {
  const isCustomPersona = formType === "custom-persona";
  
  return z.object({
    name: isCustomPersona 
      ? z.string().optional()
      : z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    company: z.string().optional(),
    walletAddress: z.string().optional(),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
    formType: z.string(),
  });
};

interface ContactFormProps {
  formType: "discovery" | "demo" | "contact" | "custom-persona";
  onSuccess?: () => void;
}

const ContactForm = ({ formType, onSuccess }: ContactFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create schema based on form type
  const formSchema = createFormSchema(formType);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      walletAddress: "",
      message: "",
      formType: formType,
    },
  });

  // Add debugging for form state
  console.log("Form errors:", form.formState.errors);
  console.log("Form is valid:", form.formState.isValid);
  console.log("Form values:", form.watch());

  async function onSubmit(data: FormValues) {
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form submission started with data:", data);
    console.log("Form validation state:", form.formState);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      formData.append('company', data.company || '');
      if (data.walletAddress) formData.append('walletAddress', data.walletAddress);
      formData.append('message', data.message);
      formData.append('formType', data.formType);

      console.log("Sending form data to Formspree...");
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      const response = await fetch('https://formspree.io/f/xjkrowgl', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log("Formspree response status:", response.status);
      console.log("Formspree response:", response);

      if (response.ok) {
        console.log("Form submitted successfully");
        toast({
          title: "Message sent successfully",
          description: "We'll get back to you as soon as possible.",
        });
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.text();
        console.error("Formspree error response:", errorData);
        throw new Error(`Failed to send message: ${response.status}`);
      }
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

  const isCustomPersona = formType === "custom-persona";

  // Add click handler debugging
  const handleSubmitClick = () => {
    console.log("=== SUBMIT BUTTON CLICKED ===");
    console.log("Form is submitting:", isSubmitting);
    console.log("Form state:", form.formState);
    console.log("Current form values:", form.getValues());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isCustomPersona && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your name" 
                    {...field} 
                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address {isCustomPersona && "(Optional)"}</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  {...field} 
                  className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isCustomPersona && (
          <FormField
            control={form.control}
            name="walletAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ETH Wallet (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="0x..." 
                    {...field} 
                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {!isCustomPersona && (
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your organization" 
                    {...field} 
                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Message</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder={isCustomPersona 
                    ? "Tell us about your experience with PersonaAI, building and using personas" 
                    : "How can we help you?"}
                  {...field}
                  className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
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
          onClick={handleSubmitClick}
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
