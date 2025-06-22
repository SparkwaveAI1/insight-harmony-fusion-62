
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '@/components/ui-custom/Section';
import { toast } from 'sonner';
import HistoricalCharacterHeader from '../components/HistoricalCharacterHeader';
import HistoricalCharacterForm from '../components/HistoricalCharacterForm';
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { generateCharacterFromFormData } from '../services/characterGenerator';
import { saveCharacter } from '../services/characterService';
import { supabase } from '@/integrations/supabase/client';

const HistoricalCharacterCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackClick = () => {
    navigate('/characters');
  };

  const onSubmit = async (data: HistoricalCharacterFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Creating historical character with trait architecture:', data);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to create characters');
      }
      
      // Generate character with full trait architecture
      const character = await generateCharacterFromFormData(data);
      character.user_id = user.id;
      
      // Save character to database
      const savedCharacter = await saveCharacter(character);
      
      console.log('✅ Historical character created with trait architecture:', savedCharacter);
      toast.success('Historical character created successfully!');
      navigate('/characters');
    } catch (error) {
      console.error('Error creating historical character:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create historical character');
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
          <HistoricalCharacterHeader onBackClick={handleBackClick} />
          <HistoricalCharacterForm 
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
          />
        </Section>
      </div>
    </div>
  );
};

export default HistoricalCharacterCreate;
