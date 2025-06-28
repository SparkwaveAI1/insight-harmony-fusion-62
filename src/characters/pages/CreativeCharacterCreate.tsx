
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import FormSectionWrapper from '@/components/ui-custom/FormSectionWrapper';
import { toast } from 'sonner';

const creativeCharacterSchema = z.object({
  name: z.string().min(1, 'Character name is required'),
  description: z.string().optional(),
  backstory: z.string().optional(),
  personality_traits: z.string().optional(),
  appearance: z.string().optional(),
  // TODO: Add creative-specific traits
});

type CreativeCharacterFormData = z.infer<typeof creativeCharacterSchema>;

const CreativeCharacterCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreativeCharacterFormData>({
    resolver: zodResolver(creativeCharacterSchema),
    defaultValues: {
      name: '',
      description: '',
      backstory: '',
      personality_traits: '',
      appearance: '',
    },
  });

  const onSubmit = async (data: CreativeCharacterFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement creative character creation service
      console.log('Creating creative character:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Creative character created successfully!');
      navigate('/characters/creative');
    } catch (error) {
      console.error('Error creating creative character:', error);
      toast.error('Failed to create creative character');
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
              onClick={() => navigate('/characters/creative')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Creative Characters
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Create Creative Character</h1>
              <p className="text-muted-foreground">Design an original creative character</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Coming Soon</h3>
                  <p className="text-blue-700 text-sm">
                    The creative character creation interface is being designed with custom traits. 
                    We'll determine the specific trait architecture for creative characters.
                  </p>
                </div>
              </div>
            </Card>

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
                              placeholder="Brief description of your creative character"
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
                    {isSubmitting ? 'Creating...' : 'Create Creative Character'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/characters/creative')}
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

export default CreativeCharacterCreate;
