
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CreativeCharacterData } from '../types';

interface Step7EnvironmentProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step7Environment = ({ formData, setFormData }: Step7EnvironmentProps) => {
  const handleChange = (value: string) => {
    setFormData({
      ...formData,
      environment: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment & Habitat</h2>
        <p className="text-muted-foreground text-sm">
          Where does your character exist and thrive?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="environment" className="text-sm font-medium">
          Primary Environment *
        </Label>
        <Textarea
          id="environment"
          placeholder="Describe the environment where your character lives, operates, or feels most at home. This could be physical spaces, digital realms, social contexts, or abstract dimensions."
          value={formData.environment}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>
    </div>
  );
};

export default Step7Environment;
