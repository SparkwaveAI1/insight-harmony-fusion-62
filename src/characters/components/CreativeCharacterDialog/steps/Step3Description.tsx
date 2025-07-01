
import { Textarea } from '@/components/ui/textarea';
import { CreativeCharacterData } from '../types';

interface Step5DescriptionProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step5Description = ({ formData, setFormData }: Step5DescriptionProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold">Describe what you have in mind for this character</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Freeform description - we'll extract aesthetic cues and unique attributes.</p>
      </div>
      
      <div className="space-y-4">
        <Textarea
          placeholder="What drives them? What makes them unique? How do they think or perceive reality? What is their nature or essence?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
        />
        <div className="text-xs sm:text-sm text-muted-foreground text-right">
          {formData.description.length}/500 characters (minimum 50)
        </div>
      </div>
    </div>
  );
};

export default Step5Description;
