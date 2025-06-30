
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CreativeCharacterData } from '../types';

interface Step6PhysicalAppearanceProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step6PhysicalAppearance = ({ formData, setFormData }: Step6PhysicalAppearanceProps) => {
  const handleChange = (value: string) => {
    setFormData({
      ...formData,
      physicalAppearanceDescription: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Physical Appearance</h2>
        <p className="text-muted-foreground text-sm">
          Describe how your character looks physically - this will be used for image generation
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="physicalAppearanceDescription" className="text-sm font-medium">
          Detailed Physical Description *
        </Label>
        <Textarea
          id="physicalAppearanceDescription"
          placeholder="Describe the character's physical appearance in detail. Include height, build, hair color and style, eye color, skin tone, facial features, clothing or attire, and any distinctive physical characteristics. Be specific and visual - this description will be used to generate the character's image."
          value={formData.physicalAppearanceDescription}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Example: "Tall, lean figure with flowing silver hair and piercing blue eyes. Pale, ethereal skin with sharp cheekbones. Wears flowing robes with intricate patterns. Has long, graceful fingers and an otherworldly presence."
        </p>
      </div>
    </div>
  );
};

export default Step6PhysicalAppearance;
