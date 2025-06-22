
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import FormSectionWrapper from '@/components/ui-custom/FormSectionWrapper';
import { toast } from 'sonner';

const characterSchema = z.object({
  name: z.string().min(1, 'Character name is required'),
  description: z.string().optional(),
  backstory: z.string().optional(),
  personality_traits: z.string().optional(),
  appearance: z.string().optional(),
});

type CharacterFormData = z.infer<typeof characterSchema>;

const CharacterCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: '',
      description: '',
      backstory: '',
      personality_traits: '',
      appearance: '',
    },
  });

  const onSubmit = async (data: CharacterFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement character creation service
      console.log('Creating character:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Character created successfully!');
      navigate('/characters');
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Failed to create character');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Section>
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/characters')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Characters
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Create Character</h1>
              <p className="text-muted-foreground">Design your custom character</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormSectionWrapper title="Basic Information">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Character Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter character name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of your character"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSectionWrapper>

                <FormSectionWrapper title="Character Details">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="backstory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Backstory</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your character's background and history"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personality_traits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personality Traits</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your character's personality, quirks, and traits"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="appearance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Appearance</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your character's physical appearance"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSectionWrapper>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Creating...' : 'Create Character'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/characters')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default CharacterCreate;
