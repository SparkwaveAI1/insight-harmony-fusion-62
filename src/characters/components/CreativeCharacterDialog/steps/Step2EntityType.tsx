
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreativeCharacterData } from '../types';

interface Step2EntityTypeProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step2EntityType = ({ formData, setFormData }: Step2EntityTypeProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold">What kind of entity are you creating?</h3>
        <p className="text-sm sm:text-base text-muted-foreground">This sets the trait architecture but keeps full expressive flexibility.</p>
      </div>
      
      <RadioGroup 
        value={formData.entityType} 
        onValueChange={(value) => setFormData({ ...formData, entityType: value })}
        className="space-y-3 sm:space-y-4"
      >
        <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value="human" id="human" />
          <Label htmlFor="human" className="flex-1 cursor-pointer">
            <div className="font-medium text-sm sm:text-base">🔘 Human / Humanoid</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Traditional human psychology and traits</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value="non-humanoid" id="non-humanoid" />
          <Label htmlFor="non-humanoid" className="flex-1 cursor-pointer">
            <div className="font-medium text-sm sm:text-base">🔘 Non-Humanoid / Multi-Species</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Alien consciousness, AI, or other non-human entity</div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default Step2EntityType;
