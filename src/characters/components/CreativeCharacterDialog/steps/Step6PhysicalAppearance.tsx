
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CreativeCharacterData } from '../types';

interface Step6PhysicalAppearanceProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step6PhysicalAppearance = ({ formData, setFormData }: Step6PhysicalAppearanceProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Physical Appearance</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Describe how your character looks in detail. This will be used for image generation.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="physicalAppearance">Physical Description *</Label>
        <Textarea
          id="physicalAppearance"
          placeholder="Describe your character's physical appearance in detail (height, build, coloring, distinguishing features, etc.)"
          value={formData.physicalAppearanceDescription}
          onChange={(e) => setFormData({
            ...formData,
            physicalAppearanceDescription: e.target.value
          })}
          className="min-h-[120px]"
        />
        <p className="text-xs text-muted-foreground">
          Be specific about visual details - this helps generate accurate character images.
        </p>
      </div>

      {formData.physicalAppearanceDescription.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 font-medium mb-1">Preview:</p>
          <p className="text-sm text-blue-800">{formData.physicalAppearanceDescription}</p>
        </div>
      )}
    </div>
  );
};

export default Step6PhysicalAppearance;
