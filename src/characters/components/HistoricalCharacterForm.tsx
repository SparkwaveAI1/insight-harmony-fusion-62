
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import FormSectionWrapper from '@/components/ui-custom/FormSectionWrapper';
import { historicalCharacterSchema, HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';

interface HistoricalCharacterFormProps {
  onSubmit: (data: HistoricalCharacterFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const HistoricalCharacterForm = ({ onSubmit, isSubmitting, onCancel }: HistoricalCharacterFormProps) => {
  const form = useForm<HistoricalCharacterFormData>({
    resolver: zodResolver(historicalCharacterSchema),
    defaultValues: {
      name: '',
      date_of_birth: '',
      age: '',
      location: '',
      description: '',
      backstory: '',
      personality_traits: '',
      appearance: '',
      occupation: '',
      historical_context: '',
    },
  });

  return (
    <div className="max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormSectionWrapper title="Basic Information (Required)">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter character's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., March 15, 1767" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 56" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Virginia, United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSectionWrapper>

          <FormSectionWrapper title="Historical Context">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Occupation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., President, Military General" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="historical_context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Context</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the historical events and circumstances surrounding this character"
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

              <FormField
                control={form.control}
                name="backstory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background & Early Life</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your character's background and early life"
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
                        placeholder="Describe your character's personality, leadership style, and character traits"
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
                    <FormLabel>Physical Appearance</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your character's physical appearance based on historical records"
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
              {isSubmitting ? 'Creating...' : 'Create Historical Character'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default HistoricalCharacterForm;
