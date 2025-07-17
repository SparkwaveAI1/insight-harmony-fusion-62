
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X, Zap } from 'lucide-react';
import { CreativeCharacterData } from '../types';

interface Step3CoreIdentityProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step3CoreIdentity = ({ formData, setFormData }: Step3CoreIdentityProps) => {
  const addActivity = () => {
    setFormData({
      ...formData,
      keyActivities: [...formData.keyActivities, '']
    });
  };

  const updateActivity = (index: number, value: string) => {
    const newActivities = [...formData.keyActivities];
    newActivities[index] = value;
    setFormData({
      ...formData,
      keyActivities: newActivities
    });
  };

  const removeActivity = (index: number) => {
    setFormData({
      ...formData,
      keyActivities: formData.keyActivities.filter((_, i) => i !== index)
    });
  };

  const addKnowledge = () => {
    setFormData({
      ...formData,
      importantKnowledge: [...formData.importantKnowledge, '']
    });
  };

  const updateKnowledge = (index: number, value: string) => {
    const newKnowledge = [...formData.importantKnowledge];
    newKnowledge[index] = value;
    setFormData({
      ...formData,
      importantKnowledge: newKnowledge
    });
  };

  const removeKnowledge = (index: number) => {
    setFormData({
      ...formData,
      importantKnowledge: formData.importantKnowledge.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Zap className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Core Identity</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Define the essential elements that make this character unique. These will never be forgotten.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="primaryAbility" className="text-sm font-medium">
            Primary Ability/Power *
          </Label>
          <Input
            id="primaryAbility"
            value={formData.primaryAbility}
            onChange={(e) => setFormData({ ...formData, primaryAbility: e.target.value })}
            placeholder="e.g., Memory Erasure, Time Manipulation, Telepathy"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            What is their main supernatural ability or special skill?
          </p>
        </div>

        <div>
          <Label htmlFor="corePurpose" className="text-sm font-medium">
            Core Purpose/Role *
          </Label>
          <Input
            id="corePurpose"
            value={formData.corePurpose}
            onChange={(e) => setFormData({ ...formData, corePurpose: e.target.value })}
            placeholder="e.g., Secret Agent, Guardian, Explorer, Scholar"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            What is their primary role or purpose in their world?
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium">Key Activities</Label>
          <p className="text-xs text-muted-foreground mb-2">
            What does this character regularly do? What are their typical actions?
          </p>
          <div className="space-y-2">
            {formData.keyActivities.map((activity, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={activity}
                  onChange={(e) => updateActivity(index, e.target.value)}
                  placeholder="e.g., Infiltration, Memory Modification, Combat Training"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeActivity(index)}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addActivity}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Important Knowledge</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Critical things this character knows about themselves and their world
          </p>
          <div className="space-y-2">
            {formData.importantKnowledge.map((knowledge, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={knowledge}
                  onChange={(e) => updateKnowledge(index, e.target.value)}
                  placeholder="e.g., Knows they can erase memories, Works for secret organization"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeKnowledge(index)}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addKnowledge}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Knowledge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3CoreIdentity;
