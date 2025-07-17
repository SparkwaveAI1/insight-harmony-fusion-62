
import { Input } from '@/components/ui/input';
import { CreativeCharacterData } from '../types';

interface Step1NameInputProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step1NameInput = ({ formData, setFormData }: Step1NameInputProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold">What is your character's name?</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Give your creative character a memorable name.</p>
      </div>
      
      <div className="space-y-4">
        <Input
          placeholder="e.g., Zephyr, Axiom, Vex, Echo..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="text-center text-base sm:text-lg"
        />
      </div>
    </div>
  );
};

export default Step1NameInput;
