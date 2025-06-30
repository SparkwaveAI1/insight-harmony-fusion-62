
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { CreativeCharacterData } from '../types';

interface Step8DrivesProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step8Drives = ({ formData, setFormData }: Step8DrivesProps) => {
  const [newCoreDrive, setNewCoreDrive] = useState('');
  const [newSurfaceTrigger, setNewSurfaceTrigger] = useState('');

  const addCoreDrive = () => {
    if (newCoreDrive.trim() && !formData.coreDrives.includes(newCoreDrive.trim())) {
      setFormData({
        ...formData,
        coreDrives: [...formData.coreDrives, newCoreDrive.trim()]
      });
      setNewCoreDrive('');
    }
  };

  const removeCoreDrive = (drive: string) => {
    setFormData({
      ...formData,
      coreDrives: formData.coreDrives.filter(d => d !== drive)
    });
  };

  const addSurfaceTrigger = () => {
    if (newSurfaceTrigger.trim() && !formData.surfaceTriggers.includes(newSurfaceTrigger.trim())) {
      setFormData({
        ...formData,
        surfaceTriggers: [...formData.surfaceTriggers, newSurfaceTrigger.trim()]
      });
      setNewSurfaceTrigger('');
    }
  };

  const removeSurfaceTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      surfaceTriggers: formData.surfaceTriggers.filter(t => t !== trigger)
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Core Drives & Triggers</h2>
        <p className="text-muted-foreground text-sm">
          What fundamentally motivates your character and what specific things activate them?
        </p>
      </div>

      {/* Core Drives */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Core Drives *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Seek knowledge, Protect others, Create beauty"
            value={newCoreDrive}
            onChange={(e) => setNewCoreDrive(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCoreDrive()}
          />
          <Button type="button" onClick={addCoreDrive} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {formData.coreDrives.map((drive, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {drive}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeCoreDrive(drive)}
              />
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Deep, fundamental motivations that guide your character's actions
        </p>
      </div>

      {/* Surface Triggers */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Surface Triggers *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Bright lights, Loud noises, Specific words"
            value={newSurfaceTrigger}
            onChange={(e) => setNewSurfaceTrigger(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSurfaceTrigger()}
          />
          <Button type="button" onClick={addSurfaceTrigger} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {formData.surfaceTriggers.map((trigger, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {trigger}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeSurfaceTrigger(trigger)}
              />
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Immediate environmental or situational factors that provoke reactions
        </p>
      </div>
    </div>
  );
};

export default Step8Drives;
