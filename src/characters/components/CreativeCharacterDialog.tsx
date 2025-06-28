
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CreativeCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: CreativeCharacterData) => void;
}

interface CreativeCharacterData {
  identityType: string;
  archetype: string;
  location: string;
  era: string;
  genres: string[];
  description: string;
}

const CreativeCharacterDialog = ({ open, onOpenChange, onComplete }: CreativeCharacterDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreativeCharacterData>({
    identityType: '',
    archetype: '',
    location: '',
    era: '',
    genres: [],
    description: ''
  });

  const totalSteps = 5;

  const humanArchetypes = [
    'Explorer', 'Monarch', 'Mystic', 'Warrior', 'Philosopher', 
    'Rebel', 'Merchant', 'Artisan', 'Spy'
  ];

  const multiSpeciesArchetypes = [
    'Hive Intelligence', 'Bioengineered Diplomat', 'Interdimensional Oracle',
    'Terraforming Entity', 'Spirit-Bound AI', 'Dream-Eater'
  ];

  const historicalEras = [
    'Ancient Times (3000 BCE - 500 CE)',
    'Classical Antiquity (800 BCE - 600 CE)',
    'Medieval Period (500 - 1500 CE)',
    'Renaissance (1400 - 1600 CE)',
    '18th Century (1700s)',
    '19th Century (1800s)',
    'Early 20th Century (1900-1950)',
    'Modern Era (1950-2000)',
    'Near Future (2025-2100)',
    'Far Future (2100+)'
  ];

  const genreOptions = [
    { id: 'historical', label: 'Historical', icon: '🏛️' },
    { id: 'fantasy', label: 'Fantasy', icon: '🧝' },
    { id: 'sci-fi', label: 'Sci-Fi', icon: '🛸' },
    { id: 'mythological', label: 'Mythological', icon: '🌀' },
    { id: 'speculative', label: 'Speculative Fiction', icon: '💡' },
    { id: 'surreal', label: 'Surreal / Abstract', icon: '👁️' },
    { id: 'hybrid', label: 'Hybrid / User-Defined', icon: '🧬' }
  ];

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

  const handleGenreToggle = (genreId: string) => {
    const newGenres = formData.genres.includes(genreId)
      ? formData.genres.filter(g => g !== genreId)
      : [...formData.genres, genreId];
    
    setFormData({ ...formData, genres: newGenres });
  };

  const handleRandomize = () => {
    // Add randomization logic based on current step
    switch (currentStep) {
      case 1:
        setFormData({ ...formData, identityType: Math.random() > 0.5 ? 'human' : 'multi-species' });
        break;
      case 2:
        const archetypes = formData.identityType === 'human' ? humanArchetypes : multiSpeciesArchetypes;
        setFormData({ ...formData, archetype: archetypes[Math.floor(Math.random() * archetypes.length)] });
        break;
      case 3:
        setFormData({ 
          ...formData, 
          era: historicalEras[Math.floor(Math.random() * historicalEras.length)],
          location: 'Random location based on era'
        });
        break;
      case 4:
        const randomGenres = genreOptions
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 3) + 1)
          .map(g => g.id);
        setFormData({ ...formData, genres: randomGenres });
        break;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.identityType !== '';
      case 2: return formData.archetype !== '';
      case 3: return formData.era !== '' && formData.location !== '';
      case 4: return formData.genres.length > 0;
      case 5: return formData.description.length >= 50;
      default: return false;
    }
  };

  const handleComplete = () => {
    onComplete(formData);
    onOpenChange(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">What kind of being are you creating?</h3>
              <p className="text-muted-foreground">This determines the trait architecture used for your character.</p>
            </div>
            
            <RadioGroup 
              value={formData.identityType} 
              onValueChange={(value) => setFormData({ ...formData, identityType: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="human" id="human" />
                <Label htmlFor="human" className="flex-1 cursor-pointer">
                  <div className="font-medium">🔘 Human or Humanoid</div>
                  <div className="text-sm text-muted-foreground">Traditional human characteristics and psychology</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="multi-species" id="multi-species" />
                <Label htmlFor="multi-species" className="flex-1 cursor-pointer">
                  <div className="font-medium">🔘 Multi-Species / Non-Human Entity</div>
                  <div className="text-sm text-muted-foreground">Alien, AI, or other non-human consciousness</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">What broad kind of mind or role does this character represent?</h3>
              <p className="text-muted-foreground">Choose an archetype that defines their core nature.</p>
            </div>
            
            <Select value={formData.archetype} onValueChange={(value) => setFormData({ ...formData, archetype: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select an archetype..." />
              </SelectTrigger>
              <SelectContent>
                {(formData.identityType === 'human' ? humanArchetypes : multiSpeciesArchetypes).map((archetype) => (
                  <SelectItem key={archetype} value={archetype}>
                    {archetype}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Where and when do they exist?</h3>
              <p className="text-muted-foreground">Define their temporal and spatial context.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Era / Time Period</Label>
                <Select value={formData.era} onValueChange={(value) => setFormData({ ...formData, era: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time period..." />
                  </SelectTrigger>
                  <SelectContent>
                    {historicalEras.map((era) => (
                      <SelectItem key={era} value={era}>
                        {era}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Location / Region</Label>
                <Textarea
                  placeholder={formData.identityType === 'human' 
                    ? 'e.g., Sullivan County, Baghdad, Andean Highlands'
                    : 'e.g., On the Red Spiral moons during the Collapse, Between universe cycles'
                  }
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">What narrative genre does this character belong to?</h3>
              <p className="text-muted-foreground">Select one or more genres that define their world's tone.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {genreOptions.map((genre) => (
                <div
                  key={genre.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.genres.includes(genre.id)
                      ? 'border-primary bg-primary/10'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleGenreToggle(genre.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{genre.icon}</span>
                    <span className="font-medium">{genre.label}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {formData.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.genres.map((genreId) => {
                  const genre = genreOptions.find(g => g.id === genreId);
                  return (
                    <Badge key={genreId} variant="secondary">
                      {genre?.icon} {genre?.label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Tell us more about this character</h3>
              <p className="text-muted-foreground">What drives them? What kind of world do they live in?</p>
            </div>
            
            <div className="space-y-4">
              <Textarea
                placeholder="What drives them? What kind of world do they live in? What is their place in that world?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px]"
              />
              <div className="text-sm text-muted-foreground text-right">
                {formData.description.length}/500 characters (minimum 50)
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Character Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Type:</strong> {formData.identityType === 'human' ? 'Human/Humanoid' : 'Multi-Species Entity'}</p>
                <p><strong>Archetype:</strong> {formData.archetype}</p>
                <p><strong>Era:</strong> {formData.era}</p>
                <p><strong>Location:</strong> {formData.location}</p>
                <p><strong>Genres:</strong> {formData.genres.map(g => genreOptions.find(opt => opt.id === g)?.label).join(', ')}</p>
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
              Create Character
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreativeCharacterDialog;
