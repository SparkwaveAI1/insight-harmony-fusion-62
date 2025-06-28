
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
      gender: '',
      social_class: '',
      region: '',
      height_build: '',
      hair: '',
      eye_color: '',
      skin_tone: '',
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
          <FormSectionWrapper title="Basic Information">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date *</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
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
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </FormSectionWrapper>

          <FormSectionWrapper title="Physical Appearance">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="height_build"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height & Build</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., tall, average, 5 feet 8 inches, 175cm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hair"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hair</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., dark brown, powdered wig" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="appearance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Physical Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe other notable physical features, clothing style, or distinguishing characteristics"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSectionWrapper>

          <FormSectionWrapper title="Character Background">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="backstory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background & Early Life</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your character's background, upbringing, and formative experiences"
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
                    <FormLabel>Personality & Character Traits</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe personality, leadership style, values, and key character traits"
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
                name="historical_context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Context</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the historical events, circumstances, and social environment of this character's time"
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
