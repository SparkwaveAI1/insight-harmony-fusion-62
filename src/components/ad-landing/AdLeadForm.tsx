
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
import { ArrowRight, Loader2 } from "lucide-react";

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  company: z.string().optional(),
  formType: z.string(),
  source: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdLeadFormProps {
  source?: string;
  onSuccess?: () => void;
  className?: string;
}

const AdLeadForm = ({ source = "landing-page", onSuccess, className }: AdLeadFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      formType: "landing-page-lead",
      source: source,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('company', data.company || '');
      formData.append('formType', data.formType);
      formData.append('source', data.source || '');

      const response = await fetch('https://formspree.io/f/xjkrowgl', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Request submitted successfully",
          description: "We'll be in touch soon!",
        });
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      console.error('Lead form error:', error);
      toast({
        title: "Error sending request",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className={`bg-primary/10 p-6 rounded-lg shadow-sm border border-primary/20 ${className}`}>
        <h3 className="text-xl font-bold mb-4 text-primary">Thank you!</h3>
        <p className="mb-3">Your request has been received successfully.</p>
        <p>Our team will contact you shortly to discuss your custom AI personas.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-100 ${className}`}>
      <h3 className="text-xl font-bold mb-6">Get Custom AI Personas for Your Business</h3>
      
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

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary/80"
            size="lg" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Request Custom AI Personas
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdLeadForm;
