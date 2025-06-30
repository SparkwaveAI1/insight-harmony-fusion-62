
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import FormSectionWrapper from '@/components/ui-custom/FormSectionWrapper';
import { historicalCharacterSchema, HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface HistoricalCharacterFormProps {
  onSubmit: (data: HistoricalCharacterFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const HistoricalCharacterForm = ({ onSubmit, isSubmitting, onCancel }: HistoricalCharacterFormProps) => {
  const [searchParams] = useSearchParams();
  const isPrefilled = searchParams.get('prefill') === 'true';
  
  const form = useForm<HistoricalCharacterFormData>({
    resolver: zodResolver(historicalCharacterSchema),
    defaultValues: {
      name: '',
      date_of_birth: '',
      age: '',
      location: '',
      description: '',
      physical_appearance_description: '',
    },
  });

  useEffect(() => {
    if (isPrefilled) {
      const prefilledData = {
        name: searchParams.get('name') || 'Creative Character',
        description: searchParams.get('description') || '',
        location: searchParams.get('location') || '',
        physical_appearance_description: searchParams.get('physicalForm') || '',
        // Extract approximate date and age from era if available
        date_of_birth: extractDateFromEra(searchParams.get('era') || ''),
        age: '25', // Default age, user can modify
      };
      
      form.reset(prefilledData);
    }
  }, [isPrefilled, searchParams, form]);

  const extractDateFromEra = (era: string): string => {
    // Simple extraction logic - this could be more sophisticated
    const yearMatch = era.match(/(\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      return `${year}-01-01`;
    }
    return '';
  };

  return (
    <div className="max-w-2xl">
      {isPrefilled && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Creative Character Genesis</h3>
          <p className="text-sm text-blue-800">
            This form has been pre-filled with information from your Creative Character Genesis process. 
            Please review and adjust the details as needed, especially the specific dates and any other details you'd like to refine.
          </p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormSectionWrapper title="Create Historical Character">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Benjamin Franklin" {...field} />
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
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1745-03-15" {...field} />
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
                        <Input placeholder="e.g., 32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Boston, Massachusetts" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your historical character's background, personality, occupation, beliefs, and historical context. Include their role in society and what they're known for."
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
                name="physical_appearance_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Appearance Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how this character looks physically. Include details like height, build, hair color and style, eye color, skin tone, facial features, clothing style typical of their era, and any distinctive physical characteristics."
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
              {isSubmitting ? 'Creating Character...' : 'Create Historical Character'}
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
