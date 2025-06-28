
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '@/components/ui-custom/Section';
import { toast } from 'sonner';
import CreativeCharacterHeader from '../components/CreativeCharacterHeader';
import CreativeCharacterForm from '../components/CreativeCharacterForm';
import { CreativeCharacterFormData } from '../schemas/creativeCharacterSchema';
import { generateCreativeCharacter } from '../services/creativeCharacterGenerator';
import { saveCharacter } from '../services/characterService';
import { supabase } from '@/integrations/supabase/client';

const CreativeCharacterCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackClick = () => {
    navigate('/characters');
  };

  const onSubmit = async (data: CreativeCharacterFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Creating creative character with form data:', data);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to create characters');
      }
      
      // Generate creative character with full trait architecture
      const character = await generateCreativeCharacter(data);
      character.user_id = user.id;
      
      // Save character to database
      const savedCharacter = await saveCharacter(character);
      
      console.log('✅ Creative character created successfully:', savedCharacter);
      toast.success('Creative character created successfully!');
      
      // Navigate to the newly created character's detail page
      navigate(`/characters/${savedCharacter.character_id}`);
    } catch (error) {
      console.error('Error creating creative character:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create creative character');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/characters');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Section>
          <CreativeCharacterHeader onBackClick={handleBackClick} />
          <CreativeCharacterForm 
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
          />
        </Section>
      </div>
    </div>
  );
};

export default CreativeCharacterCreate;
