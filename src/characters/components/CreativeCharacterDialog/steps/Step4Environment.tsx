
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreativeCharacterData } from '../types';

interface Step4EnvironmentProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step4Environment = ({ formData, setFormData }: Step4EnvironmentProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold">Physical Form/Appearance</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Describe how this character looks and appears in their world.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-xs sm:text-sm font-medium mb-2 block">Physical Description</Label>
          <Textarea
            placeholder={formData.narrativeDomain === 'sci-fi' 
              ? 'e.g., Sleek metallic form with glowing circuits, ethereal energy being, cybernetic enhancements...'
              : formData.narrativeDomain === 'fantasy'
              ? 'e.g., Towering with ancient bark skin, shimmering scales, translucent wings...'
              : 'e.g., Shifting geometric patterns, made of living shadow, crystalline structure...'
            }
            value={formData.environment}
            onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
            className="min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
          />
        </div>
        
        <div>
          <Label className="text-xs sm:text-sm font-medium mb-2 block">Size/Scale (Optional)</Label>
          <Input
            placeholder="e.g., Human-sized, Massive giant, Tiny fairy-like, Variable size..."
            value={formData.physicalForm}
            onChange={(e) => setFormData({ ...formData, physicalForm: e.target.value })}
            className="text-sm sm:text-base"
          />
        </div>
        
        <div>
          <Label className="text-xs sm:text-sm font-medium mb-2 block">Notable Features (Optional)</Label>
          <Input
            placeholder="e.g., Glowing eyes, Multiple limbs, Ethereal glow, Changing colors..."
            value={formData.communication}
            onChange={(e) => setFormData({ ...formData, communication: e.target.value })}
            className="text-sm sm:text-base"
          />
        </div>
      </div>
    </div>
  );
};

export default Step4Environment;
