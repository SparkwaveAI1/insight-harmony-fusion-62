
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreativeCharacterData } from '../types';
import { coreDriveOptions, surfaceTriggerOptions } from '../constants';

interface Step7DrivesProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step7Drives = ({ formData, setFormData }: Step7DrivesProps) => {
  const handleCoreDriveToggle = (drive: string) => {
    const newDrives = formData.coreDrives.includes(drive)
      ? formData.coreDrives.filter(d => d !== drive)
      : [...formData.coreDrives, drive];
    
    setFormData({ ...formData, coreDrives: newDrives });
  };

  const handleSurfaceTriggerToggle = (trigger: string) => {
    const newTriggers = formData.surfaceTriggers.includes(trigger)
      ? formData.surfaceTriggers.filter(t => t !== trigger)
      : [...formData.surfaceTriggers, trigger];
    
    setFormData({ ...formData, surfaceTriggers: newTriggers });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold">What drives them, deep down?</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          First, describe their motivations in your own words. Then select from the options below to help shape their behavior patterns.
        </p>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Custom Drive Description
          </Label>
          <Textarea
            placeholder="What truly motivates this character? What do they want most? What are they afraid of losing? (e.g., 'Seeks approval from others', 'Driven by hunger and survival', 'Wants to protect their family')"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[80px] text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This helps us understand their unique personality beyond the standard options below.
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">
            Core Drives (Choose 1-3)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            These are deep, primal motivations that guide major decisions and long-term behavior.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto">
            {coreDriveOptions.map((drive) => (
              <div key={drive} className="flex items-center space-x-2">
                <Checkbox
                  id={drive}
                  checked={formData.coreDrives.includes(drive)}
                  onCheckedChange={() => handleCoreDriveToggle(drive)}
                  disabled={!formData.coreDrives.includes(drive) && formData.coreDrives.length >= 3}
                />
                <Label htmlFor={drive} className="text-xs cursor-pointer">
                  {drive}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Surface Triggers (Choose 1-3)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            These are immediate, visible reactions - what makes them respond quickly or emotionally.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto">
            {surfaceTriggerOptions.map((trigger) => (
              <div key={trigger} className="flex items-center space-x-2">
                <Checkbox
                  id={trigger}
                  checked={formData.surfaceTriggers.includes(trigger)}
                  onCheckedChange={() => handleSurfaceTriggerToggle(trigger)}
                  disabled={!formData.surfaceTriggers.includes(trigger) && formData.surfaceTriggers.length >= 3}
                />
                <Label htmlFor={trigger} className="text-xs cursor-pointer">
                  {trigger}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7Drives;
