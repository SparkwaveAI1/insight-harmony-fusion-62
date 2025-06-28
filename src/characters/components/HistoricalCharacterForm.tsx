
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      historical_period: '',
      social_class: '',
      region: '',
      height: '',
      build_body_type: '',
      hair_color: '',
      hair_style: '',
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

          <FormSectionWrapper title="Demographics (Required)">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="historical_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Period *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1600s">1600s (17th Century)</SelectItem>
                          <SelectItem value="1700s">1700s (18th Century)</SelectItem>
                          <SelectItem value="1800s">1800s (19th Century)</SelectItem>
                          <SelectItem value="1900s">1900s (20th Century)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="social_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Class</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select social class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upper class">Upper Class</SelectItem>
                          <SelectItem value="middle class">Middle Class</SelectItem>
                          <SelectItem value="working class">Working Class</SelectItem>
                          <SelectItem value="lower class">Lower Class</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region/Country</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Virginia, England, France" {...field} />
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
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select height" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="average height">Average Height</SelectItem>
                          <SelectItem value="tall">Tall</SelectItem>
                          <SelectItem value="very tall">Very Tall</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="build_body_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Build/Body Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select build" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="slim">Slim</SelectItem>
                          <SelectItem value="average build">Average Build</SelectItem>
                          <SelectItem value="stocky">Stocky</SelectItem>
                          <SelectItem value="muscular">Muscular</SelectItem>
                          <SelectItem value="heavy-set">Heavy-set</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hair_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hair Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hair color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="dark brown">Dark Brown</SelectItem>
                          <SelectItem value="brown">Brown</SelectItem>
                          <SelectItem value="light brown">Light Brown</SelectItem>
                          <SelectItem value="blonde">Blonde</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="auburn">Auburn</SelectItem>
                          <SelectItem value="gray">Gray</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hair_style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hair Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hair style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="practical unstyled">Practical/Unstyled</SelectItem>
                          <SelectItem value="short cropped">Short Cropped</SelectItem>
                          <SelectItem value="shoulder length">Shoulder Length</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="braided">Braided</SelectItem>
                          <SelectItem value="upswept">Upswept</SelectItem>
                          <SelectItem value="curly">Curly</SelectItem>
                          <SelectItem value="wavy">Wavy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eye_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eye Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select eye color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="brown">Brown</SelectItem>
                          <SelectItem value="dark brown">Dark Brown</SelectItem>
                          <SelectItem value="hazel">Hazel</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="gray">Gray</SelectItem>
                          <SelectItem value="amber">Amber</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skin_tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skin Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select skin tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="olive">Olive</SelectItem>
                          <SelectItem value="tan">Tan</SelectItem>
                          <SelectItem value="brown">Brown</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                    <FormLabel>Additional Physical Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional physical appearance details based on historical records"
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
