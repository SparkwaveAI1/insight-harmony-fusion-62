
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreativeCharacterData } from '../types';
import { functionalRoles } from '../constants';

interface Step4FunctionalRoleProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step4FunctionalRole = ({ formData, setFormData }: Step4FunctionalRoleProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold">Do they play a specific role in their world?</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Optional - used as a soft seed for trait shaping, never rigid.</p>
      </div>
      
      <div className="space-y-4">
        <Select value={formData.functionalRole} onValueChange={(value) => setFormData({ ...formData, functionalRole: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role (or leave blank)" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="">No specific role</SelectItem>
            {functionalRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="text-xs sm:text-sm text-muted-foreground text-center">
          This is optional and serves as inspiration, not limitation.
        </div>
      </div>
    </div>
  );
};

export default Step4FunctionalRole;
