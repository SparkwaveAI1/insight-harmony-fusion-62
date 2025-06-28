
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import FormSectionWrapper from '@/components/ui-custom/FormSectionWrapper';
import { creativeCharacterSchema, CreativeCharacterFormData } from '../schemas/creativeCharacterSchema';

interface CreativeCharacterFormProps {
  onSubmit: (data: CreativeCharacterFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const CreativeCharacterForm = ({ onSubmit, isSubmitting, onCancel }: CreativeCharacterFormProps) => {
  const form = useForm<CreativeCharacterFormData>({
    resolver: zodResolver(creativeCharacterSchema),
    defaultValues: {
      name: '',
      description: '',
      genre: '',
      species: '',
      universe: '',
    },
  });

  return (
    <div className="max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormSectionWrapper title="Create Creative Character">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Zara the Starweaver" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fantasy, Sci-Fi, Cyberpunk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Species *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Elf, Android, Dragon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="universe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Universe/World *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Middle Earth, Cyberpunk 2077" {...field} />
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
                        placeholder="Describe your creative character in detail. Include their background, personality, abilities, role in their world, and any other important details. The AI will use this description to generate their complete profile including comprehensive personality traits, physical appearance, and world-specific context."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="magical_abilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Magical Abilities (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Telekinesis, Fire Magic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technological_augmentations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tech Augmentations (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cybernetic Implants, AI Interface" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="power_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power Level (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Novice, Master, Legendary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faction_allegiance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faction/Allegiance (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rebel Alliance, House Stark" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </FormSectionWrapper>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Creating Character...' : 'Create Creative Character'}
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

export default CreativeCharacterForm;
