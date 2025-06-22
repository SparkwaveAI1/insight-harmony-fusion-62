
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '@/components/ui-custom/Section';
import { toast } from 'sonner';
import HistoricalCharacterHeader from '../components/HistoricalCharacterHeader';
import HistoricalCharacterForm from '../components/HistoricalCharacterForm';
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';

const HistoricalCharacterCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackClick = () => {
    navigate('/characters');
  };

  const onSubmit = async (data: HistoricalCharacterFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement historical character creation service
      console.log('Creating historical character:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Historical character created successfully!');
      navigate('/characters');
    } catch (error) {
      console.error('Error creating historical character:', error);
      toast.error('Failed to create historical character');
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
