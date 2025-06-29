
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Shuffle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';

interface CreativeCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: CreativeCharacterData) => void;
}

interface CreativeCharacterData {
  name: string;
  entityType: string;
  narrativeDomain: string;
  functionalRole: string;
  description: string;
  environment: string;
  physicalForm: string;
  communication: string;
  coreDrives: string[];
  surfaceTriggers: string[];
  changeResponseStyle: string;
}

const CreativeCharacterDialog = ({ open, onOpenChange, onComplete }: CreativeCharacterDialogProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreativeCharacterData>({
    name: '',
    entityType: '',
    narrativeDomain: '',
    functionalRole: '',
    description: '',
    environment: '',
    physicalForm: '',
    communication: '',
    coreDrives: [],
    surfaceTriggers: [],
    changeResponseStyle: ''
  });

  const totalSteps = 8;

  const narrativeDomains = [
    { id: 'historical', label: 'Historical', icon: '📜', description: 'Grounded in real historical periods' },
    { id: 'fantasy', label: 'Fantasy', icon: '🧝', description: 'Magic, mythical creatures, enchanted worlds' },
    { id: 'sci-fi', label: 'Sci-Fi', icon: '🛸', description: 'Technology, space, future scenarios' },
    { id: 'mythic', label: 'Mythic', icon: '🔮', description: 'Archetypal, legendary, divine realms' },
    { id: 'surreal', label: 'Surreal / Abstract', icon: '🌀', description: 'Dream-like, non-linear reality' },
    { id: 'hybrid', label: 'Hybrid / Unclassified', icon: '🧬', description: 'Blends multiple genres or unique' }
  ];

  const functionalRoles = [
    'Oracle', 'Warrior', 'Guardian', 'Parasite', 'Explorer', 'Diplomat', 
    'Trickster', 'Dream-form', 'Weapon', 'Scholar', 'Prophet', 'Healer',
    'Memory Keeper', 'Pattern Weaver', 'Energy Sculptor', 'Time Gardener',
    'Void Walker', 'Reality Anchor', 'Consciousness Fragment', 'Living Algorithm'
  ];

  const coreDriveOptions = [
    'Pattern Completion', 'Influence Expansion', 'Resource Stability', 'Information Accumulation',
    'Cosmological Balance', 'Self Replication', 'Ancestral Code Obedience', 'Core Entity Loyalty',
    'Emotional Mimicry', 'Territorial Stability', 'Subordinate Protection', 'Harmony Maintenance',
    'Chaos Introduction', 'Memory Preservation', 'Reality Manipulation', 'Consciousness Evolution'
  ];

  const surfaceTriggerOptions = [
    'Ritual Disruption', 'Signal Noise Anomalies', 'Memory Interference', 'Sound Resonance',
    'Resource Fluctuation', 'Social Mimicry', 'Memory Integrity Threats', 'Honor Rituals',
    'Symbolic Anomalies', 'Power Displays', 'Ritual Breaches', 'Pattern Recognition',
    'Emotional Resonance', 'Territory Violations', 'Communication Attempts', 'Change Detection'
  ];

  const changeResponseStyles = [
    { id: 'mutate_adapt', label: 'Mutate and Adapt', description: 'Evolves and changes when challenged' },
    { id: 'suppress_contradiction', label: 'Suppress Contradiction', description: 'Rejects or blocks conflicting information' },
    { id: 'fork_behavior', label: 'Fork Behavior', description: 'Creates parallel response patterns' },
    { id: 'seek_council', label: 'Seek Council / Resonance', description: 'Looks for external guidance or harmony' },
    { id: 'collapse_destabilize', label: 'Collapse / Destabilize', description: 'Becomes unstable when contradicted' }
  ];

  const compileForHistoricalCreator = (data: CreativeCharacterData) => {
    const compiledDescription = `Creative Character Genesis - ${data.name}

${data.description}

Character Context:
- Name: ${data.name}
- Entity Type: ${data.entityType}
- Narrative Domain: ${data.narrativeDomain}
- Functional Role: ${data.functionalRole || 'Undefined'}
- Environment: ${data.environment}
- Core Drives: ${data.coreDrives.join(', ')}
- Surface Triggers: ${data.surfaceTriggers.join(', ')}
- Change Response: ${data.changeResponseStyle}
- Source: Creative Character Genesis

This character was created through the Creative Character Genesis process.`;

    const searchParams = new URLSearchParams({
      prefill: 'true',
      name: data.name,
      description: compiledDescription,
      location: data.environment,
      source: 'creative-genesis'
    });

    navigate(`/characters/create/historical?${searchParams.toString()}`);
  };

  const compileForNonHumanoidCreator = async (data: CreativeCharacterData) => {
    try {
      const { generateNonHumanoidTraits } = await import('../services/nonHumanoidTraitGenerator');
      
      const traits = await generateNonHumanoidTraits({
        name: data.name,
        description: data.description,
        entityType: data.entityType,
        narrativeDomain: data.narrativeDomain,
        functionalRole: data.functionalRole,
        environment: data.environment,
        physicalForm: data.physicalForm,
        communication: data.communication,
        coreDrives: data.coreDrives,
        surfaceTriggers: data.surfaceTriggers,
        changeResponseStyle: data.changeResponseStyle
      });

      console.log('Generated non-humanoid traits:', traits);
      onComplete(data);
      
    } catch (error) {
      console.error('Error generating non-humanoid traits:', error);
      onComplete(data);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  const handleRandomize = () => {
    switch (currentStep) {
      case 1:
        const randomNames = ['Zephyr', 'Axiom', 'Vex', 'Quill', 'Ember', 'Drift', 'Pulse', 'Void', 'Echo', 'Flux'];
        setFormData({ ...formData, name: randomNames[Math.floor(Math.random() * randomNames.length)] });
        break;
      case 2:
        setFormData({ ...formData, entityType: Math.random() > 0.5 ? 'human' : 'non-humanoid' });
        break;
      case 3:
        const randomDomain = narrativeDomains[Math.floor(Math.random() * narrativeDomains.length)];
        setFormData({ ...formData, narrativeDomain: randomDomain.id });
        break;
      case 4:
        const randomRole = functionalRoles[Math.floor(Math.random() * functionalRoles.length)];
        setFormData({ ...formData, functionalRole: randomRole });
        break;
      case 6:
        const randomEnvironment = formData.narrativeDomain === 'sci-fi' 
          ? 'Quantum processing networks beneath Europa\'s ice'
          : formData.narrativeDomain === 'fantasy'
          ? 'Ancient grove where moonlight pools into silver memory'
          : 'Liminal space between waking and dreaming';
        setFormData({ ...formData, environment: randomEnvironment });
        break;
      case 7:
        const randomDrives = coreDriveOptions
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        const randomTriggers = surfaceTriggerOptions
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);
        setFormData({ ...formData, coreDrives: randomDrives, surfaceTriggers: randomTriggers });
        break;
      case 8:
        const randomResponse = changeResponseStyles[Math.floor(Math.random() * changeResponseStyles.length)];
        setFormData({ ...formData, changeResponseStyle: randomResponse.id });
        break;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name.trim() !== '';
      case 2: return formData.entityType !== '';
      case 3: return formData.narrativeDomain !== '';
      case 4: return true; // Optional step
      case 5: return formData.description.length >= 50;
      case 6: return formData.environment.trim() !== '';
      case 7: return formData.coreDrives.length > 0;
      case 8: return formData.changeResponseStyle !== '';
      default: return false;
    }
  };

  const handleComplete = () => {
    if (formData.entityType === 'human') {
      compileForHistoricalCreator(formData);
      onOpenChange(false);
    } else {
      compileForNonHumanoidCreator(formData);
      onOpenChange(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">What is your character's name?</h3>
              <p className="text-muted-foreground">Give your creative character a memorable name.</p>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="e.g., Zephyr, Axiom, Vex, Echo..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-center text-lg"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">What kind of entity are you creating?</h3>
              <p className="text-muted-foreground">This sets the trait architecture but keeps full expressive flexibility.</p>
            </div>
            
            <RadioGroup 
              value={formData.entityType} 
              onValueChange={(value) => setFormData({ ...formData, entityType: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="human" id="human" />
                <Label htmlFor="human" className="flex-1 cursor-pointer">
                  <div className="font-medium">🔘 Human / Humanoid</div>
                  <div className="text-sm text-muted-foreground">Traditional human psychology and traits</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="non-humanoid" id="non-humanoid" />
                <Label htmlFor="non-humanoid" className="flex-1 cursor-pointer">
                  <div className="font-medium">🔘 Non-Humanoid / Multi-Species</div>
                  <div className="text-sm text-muted-foreground">Alien consciousness, AI, or other non-human entity</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">What kind of world does this character come from?</h3>
              <p className="text-muted-foreground">This determines world logic, not behavior. Influences naming, scenario compatibility, and visual design.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {narrativeDomains.map((domain) => (
                <div
                  key={domain.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.narrativeDomain === domain.id
                      ? 'border-primary bg-primary/10'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setFormData({ ...formData, narrativeDomain: domain.id })}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{domain.icon}</span>
                    <div>
                      <div className="font-medium">{domain.label}</div>
                      <div className="text-sm text-muted-foreground">{domain.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Do they play a specific role in their world?</h3>
              <p className="text-muted-foreground">Optional - used as a soft seed for trait shaping, never rigid.</p>
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
              
              <div className="text-sm text-muted-foreground text-center">
                This is optional and serves as inspiration, not limitation.
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Describe what you have in mind for this character</h3>
              <p className="text-muted-foreground">Freeform description - we'll extract aesthetic cues and unique attributes.</p>
            </div>
            
            <div className="space-y-4">
              <Textarea
                placeholder="What drives them? What makes them unique? How do they think or perceive reality? What is their nature or essence?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px]"
              />
              <div className="text-sm text-muted-foreground text-right">
                {formData.description.length}/500 characters (minimum 50)
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Where—and how—does this being exist?</h3>
              <p className="text-muted-foreground">Describe their environment and existence context.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Environment / Existence Context</Label>
                <Textarea
                  placeholder={formData.narrativeDomain === 'sci-fi' 
                    ? 'e.g., Quantum processing networks, deep space stations, digital realms...'
                    : formData.narrativeDomain === 'fantasy'
                    ? 'e.g., Ancient groves, magical academies, elemental planes...'
                    : 'e.g., Liminal spaces, dream realms, abstract dimensions...'
                  }
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              
              {formData.entityType === 'non-humanoid' && (
                <>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Physical Form (Optional)</Label>
                    <Input
                      placeholder="e.g., Energy patterns, crystalline structures, living code..."
                      value={formData.physicalForm}
                      onChange={(e) => setFormData({ ...formData, physicalForm: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Communication Method (Optional)</Label>
                    <Input
                      placeholder="e.g., Quantum resonance, color patterns, direct thought transfer..."
                      value={formData.communication}
                      onChange={(e) => setFormData({ ...formData, communication: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">What drives them, deep down?</h3>
              <p className="text-muted-foreground">Choose 1-3 core drives and surface triggers that shape their behavior.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Core Drives (Choose 1-3)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {coreDriveOptions.map((drive) => (
                    <div key={drive} className="flex items-center space-x-2">
                      <Checkbox
                        id={drive}
                        checked={formData.coreDrives.includes(drive)}
                        onCheckedChange={() => handleCoreDriveToggle(drive)}
                        disabled={!formData.coreDrives.includes(drive) && formData.coreDrives.length >= 3}
                      />
                      <Label htmlFor={drive} className="text-sm cursor-pointer">
                        {drive}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Surface Triggers (Choose 1-3)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {surfaceTriggerOptions.map((trigger) => (
                    <div key={trigger} className="flex items-center space-x-2">
                      <Checkbox
                        id={trigger}
                        checked={formData.surfaceTriggers.includes(trigger)}
                        onCheckedChange={() => handleSurfaceTriggerToggle(trigger)}
                        disabled={!formData.surfaceTriggers.includes(trigger) && formData.surfaceTriggers.length >= 3}
                      />
                      <Label htmlFor={trigger} className="text-sm cursor-pointer">
                        {trigger}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">How do they respond to change, conflict, or contradiction?</h3>
              <p className="text-muted-foreground">This enables memory modeling and contradiction resolution behavior.</p>
            </div>
            
            <RadioGroup 
              value={formData.changeResponseStyle} 
              onValueChange={(value) => setFormData({ ...formData, changeResponseStyle: value })}
              className="space-y-3"
            >
              {changeResponseStyles.map((style) => (
                <div key={style.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value={style.id} id={style.id} />
                  <Label htmlFor={style.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{style.label}</div>
                    <div className="text-sm text-muted-foreground">{style.description}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Character Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
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

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Character Genesis Creation
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i + 1 <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRandomize}
              className="flex items-center gap-1"
            >
              <Shuffle className="h-3 w-3" />
              Randomize
            </Button>
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {formData.entityType === 'human' ? 'Create Historical Character' : 'Create Character'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreativeCharacterDialog;
