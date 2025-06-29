
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreativeCharacterData } from '../types';
import { changeResponseStyles, narrativeDomains } from '../constants';

interface Step8ResponseProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step8Response = ({ formData, setFormData }: Step8ResponseProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold">How do they respond to change, conflict, or contradiction?</h3>
        <p className="text-sm sm:text-base text-muted-foreground">This enables memory modeling and contradiction resolution behavior.</p>
      </div>
      
      <RadioGroup 
        value={formData.changeResponseStyle} 
        onValueChange={(value) => setFormData({ ...formData, changeResponseStyle: value })}
        className="space-y-2 sm:space-y-3"
      >
        {changeResponseStyles.map((style) => (
          <div key={style.id} className="flex items-center space-x-3 p-2 sm:p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
            <RadioGroupItem value={style.id} id={style.id} />
            <Label htmlFor={style.id} className="flex-1 cursor-pointer">
              <div className="font-medium text-sm sm:text-base">{style.label}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{style.description}</div>
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Character Summary</h4>
        <div className="space-y-1 text-xs sm:text-sm text-blue-800">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Type:</strong> {formData.entityType === 'human' ? 'Human/Humanoid' : 'Non-Humanoid Entity'}</p>
          <p><strong>World:</strong> {narrativeDomains.find(d => d.id === formData.narrativeDomain)?.label}</p>
          <p><strong>Role:</strong> {formData.functionalRole || 'Undefined'}</p>
          <p><strong>Environment:</strong> {formData.environment}</p>
          <p><strong>Core Drives:</strong> {formData.coreDrives.join(', ')}</p>
          <p><strong>Surface Triggers:</strong> {formData.surfaceTriggers.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};

export default Step8Response;
