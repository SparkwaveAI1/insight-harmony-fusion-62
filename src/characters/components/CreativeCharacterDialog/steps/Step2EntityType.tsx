
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
        <h3 className="text-lg sm:text-xl font-semibold">What type of character are you creating?</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Choose the character type that best fits your creative vision.</p>
      </div>
      
      <RadioGroup 
        value={formData.entityType} 
        onValueChange={(value) => setFormData({ ...formData, entityType: value })}
        className="space-y-3 sm:space-y-4"
      >
        <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value="human" id="human" />
          <Label htmlFor="human" className="flex-1 cursor-pointer">
            <div className="font-medium text-sm sm:text-base">🧑 Human Character</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Traditional human with realistic psychology and traits</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value="fantasy" id="fantasy" />
          <Label htmlFor="fantasy" className="flex-1 cursor-pointer">
            <div className="font-medium text-sm sm:text-base">🧙 Fantasy Character</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Magical beings, mythical creatures, or fantasy humanoids</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value="sci-fi" id="sci-fi" />
          <Label htmlFor="sci-fi" className="flex-1 cursor-pointer">
            <div className="font-medium text-sm sm:text-base">🤖 Sci-Fi Character</div>
            <div className="text-xs sm:text-sm text-muted-foreground">AI entities, aliens, cyborgs, or futuristic beings</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value="abstract" id="abstract" />
          <Label htmlFor="abstract" className="flex-1 cursor-pointer">
            <div className="font-medium text-sm sm:text-base">✨ Abstract Entity</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Concepts, forces of nature, or non-physical entities</div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default Step2EntityType;
