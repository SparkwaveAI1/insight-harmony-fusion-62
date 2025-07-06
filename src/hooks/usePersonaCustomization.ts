
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { savePersona } from '@/services/persona/operations/savePersona';
import { Persona } from '@/services/persona/types';
import { useNavigate } from 'react-router-dom';

const customizationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().optional(),
  customization_notes: z.string().min(1, 'Customization instructions are required'),
});

export type CustomizationFormValues = z.infer<typeof customizationSchema>;

export const usePersonaCustomization = (originalPersona: Persona) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CustomizationFormValues>({
    resolver: zodResolver(customizationSchema),
    defaultValues: {
      name: `${originalPersona.name} (Customized)`,
      prompt: originalPersona.prompt || '',
      customization_notes: '',
    },
  });

  const onSubmit = async (data: CustomizationFormValues): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Starting persona customization...');
      
      // Call the customization edge function
      const { data: customizationResult, error } = await supabase.functions.invoke(
        'generate-persona-customization',
        {
          body: {
            originalPersona,
            customizationNotes: data.customization_notes,
            newName: data.name,
          }
        }
      );

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to customize persona: ${error.message}`);
      }

      if (!customizationResult.success || !customizationResult.persona) {
        console.error('Customization failed:', customizationResult.error);
        throw new Error(`Failed to customize persona: ${customizationResult.error || 'Unknown error'}`);
      }

      console.log('Persona customization successful, saving to database...');

      // Add user_id to the customized persona
      const customizedPersona = {
        ...customizationResult.persona,
        user_id: user.id,
        is_public: false,
      };

      // Save the customized persona
      const savedPersona = await savePersona(customizedPersona);

      if (savedPersona) {
        toast({
          title: "Success",
          description: `Customized persona "${data.name}" has been created successfully.`,
        });

        // Navigate to the new persona
        navigate(`/persona-detail/${savedPersona.persona_id}`);
        return true;
      } else {
        throw new Error('Failed to save customized persona');
      }

    } catch (error) {
      console.error('Error customizing persona:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to customize persona. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
  };
};
