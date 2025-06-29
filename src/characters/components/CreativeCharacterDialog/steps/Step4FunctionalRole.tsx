
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreativeCharacterData } from '../types';
import { functionalRoles } from '../constants';

interface Step4FunctionalRoleProps {
  formData: CreativeCharacterData;
  setFormData: (data: CreativeCharacterData) => void;
}

const Step4FunctionalRole = ({ formData, setFormData }: Step4FunctionalRoleProps) => {
  console.log('Step4FunctionalRole rendering with formData:', formData);
  console.log('functionalRoles array:', functionalRoles);

  // Validate functionalRoles array exists and has content
  if (!functionalRoles || !Array.isArray(functionalRoles) || functionalRoles.length === 0) {
    console.error('functionalRoles array is missing or empty:', functionalRoles);
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center space-y-2 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold">Do they play a specific role in their world?</h3>
          <p className="text-sm sm:text-base text-muted-foreground">Loading role options...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center space-y-2 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold">Do they play a specific role in their world?</h3>
          <p className="text-sm sm:text-base text-muted-foreground">Optional - used as a soft seed for trait shaping, never rigid.</p>
        </div>
        
        <RadioGroup 
          value={formData.functionalRole} 
          onValueChange={(value) => setFormData({ ...formData, functionalRole: value })}
          className="space-y-3 sm:space-y-4"
        >
          <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
            <RadioGroupItem value="" id="no-role" />
            <Label htmlFor="no-role" className="flex-1 cursor-pointer">
              <div className="font-medium text-sm sm:text-base">No specific role</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Leave role undefined</div>
            </Label>
          </div>
          
          {functionalRoles.map((role, index) => (
            <div key={role} className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value={role} id={`role-${index}`} />
              <Label htmlFor={`role-${index}`} className="flex-1 cursor-pointer">
                <div className="font-medium text-sm sm:text-base">{role}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <div className="text-xs sm:text-sm text-muted-foreground text-center">
          This is optional and serves as inspiration, not limitation.
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering Step4FunctionalRole:', error);
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center space-y-2 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold">Do they play a specific role in their world?</h3>
          <p className="text-sm sm:text-base text-muted-foreground">Error loading role options. Please try refreshing.</p>
        </div>
      </div>
    );
  }
};

export default Step4FunctionalRole;
