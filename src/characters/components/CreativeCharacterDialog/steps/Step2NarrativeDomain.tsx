
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreativeCharacterData } from '../types';
import { narrativeDomains } from '../constants';

interface Step3NarrativeDomainProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step3NarrativeDomain = ({ formData, setFormData }: Step3NarrativeDomainProps) => {
  const handleNarrativeDomainSelect = (domainId: string) => {
    console.log('Narrative domain selected:', domainId);
    setFormData({ ...formData, narrativeDomain: domainId });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold">What kind of world does this character come from?</h3>
        <p className="text-sm sm:text-base text-muted-foreground">This determines world logic, not behavior. Influences naming, scenario compatibility, and visual design.</p>
      </div>
      
      <RadioGroup 
        value={formData.narrativeDomain} 
        onValueChange={handleNarrativeDomainSelect}
        className="space-y-2 sm:space-y-3"
      >
        {narrativeDomains.map((domain) => (
          <div key={domain.id} className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
            <RadioGroupItem value={domain.id} id={domain.id} />
            <Label htmlFor={domain.id} className="flex-1 cursor-pointer">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <span className="text-xl sm:text-2xl">{domain.icon}</span>
                <div>
                  <div className="font-medium text-sm sm:text-base">{domain.label}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{domain.description}</div>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default Step3NarrativeDomain;
