
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
        <h3 className="text-lg sm:text-xl font-semibold">Where—and how—does this being exist?</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Describe their environment and existence context.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-xs sm:text-sm font-medium mb-2 block">Environment / Existence Context</Label>
          <Textarea
            placeholder={formData.narrativeDomain === 'sci-fi' 
              ? 'e.g., Quantum processing networks, deep space stations, digital realms...'
              : formData.narrativeDomain === 'fantasy'
              ? 'e.g., Ancient groves, magical academies, elemental planes...'
              : 'e.g., Liminal spaces, dream realms, abstract dimensions...'
            }
            value={formData.environment}
            onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
            className="min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
          />
        </div>
        
        <div>
          <Label className="text-xs sm:text-sm font-medium mb-2 block">Physical Form (Optional)</Label>
          <Input
            placeholder="e.g., Energy patterns, crystalline structures, living code..."
            value={formData.physicalForm}
            onChange={(e) => setFormData({ ...formData, physicalForm: e.target.value })}
            className="text-sm sm:text-base"
          />
        </div>
        
        <div>
          <Label className="text-xs sm:text-sm font-medium mb-2 block">Communication Method (Optional)</Label>
          <Input
            placeholder="e.g., Quantum resonance, color patterns, direct thought transfer..."
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
