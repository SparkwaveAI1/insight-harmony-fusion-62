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
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreativeCharacterData>({
    identityType: '',
    archetype: '',
    location: '',
    era: '',
    genres: [],
    description: ''
  });
  const [customArchetype, setCustomArchetype] = useState('');
  const [customGenres, setCustomGenres] = useState<string[]>([]);
  const [newCustomGenre, setNewCustomGenre] = useState('');

  const totalSteps = 5;

  const humanArchetypes = [
    { value: 'Explorer', description: 'Seeks new territories, knowledge, or experiences' },
    { value: 'Monarch', description: 'Natural leader who commands respect and authority' },
    { value: 'Mystic', description: 'Connected to spiritual or supernatural forces' },
    { value: 'Warrior', description: 'Fighter who protects or conquers through strength' },
    { value: 'Philosopher', description: 'Seeker of wisdom and understanding of existence' },
    { value: 'Rebel', description: 'Challenges established order and fights for change' },
    { value: 'Merchant', description: 'Trader who creates value through exchange and commerce' },
    { value: 'Artisan', description: 'Creator who shapes the world through craft and skill' },
    { value: 'Spy', description: 'Operates in shadows, gathering intelligence and secrets' },
    { value: 'Healer', description: 'Mends bodies, minds, or spirits of others' },
    { value: 'Scholar', description: 'Devoted to learning, research, and knowledge preservation' },
    { value: 'Nomad', description: 'Wanderer who belongs to no fixed place or society' },
    { value: 'Guardian', description: 'Protector of people, places, or sacred things' },
    { value: 'Trickster', description: 'Uses wit, humor, and cunning to navigate the world' },
    { value: 'Sage', description: 'Wise counselor who guides others with deep understanding' },
    { value: 'Custom', description: 'Define your own unique archetype' }
  ];

  const multiSpeciesArchetypes = [
    { value: 'Hive Intelligence', description: 'Collective consciousness operating as one mind' },
    { value: 'Bioengineered Diplomat', description: 'Designed entity bridging different species or realms' },
    { value: 'Interdimensional Oracle', description: 'Seer who perceives across multiple realities' },
    { value: 'Terraforming Entity', description: 'Being that shapes worlds and environments' },
    { value: 'Spirit-Bound AI', description: 'Artificial intelligence merged with spiritual essence' },
    { value: 'Dream-Eater', description: 'Entity that feeds on thoughts, dreams, or emotions' },
    { value: 'Quantum Shepherd', description: 'Guardian of probability streams and possibilities' },
    { value: 'Memory Weaver', description: 'Curator of experiences across time and space' },
    { value: 'Void Walker', description: 'Traveler between the spaces that separate realities' },
    { value: 'Symbiotic Network', description: 'Multiple beings functioning as integrated system' },
    { value: 'Energy Sculptor', description: 'Manipulator of fundamental forces and matter' },
    { value: 'Time Gardener', description: 'Cultivator of temporal flows and causality' },
    { value: 'Custom', description: 'Define your own unique non-human entity' }
  ];

  const globalEras = [
    'Prehistoric Era (Before 3000 BCE)',
    'Ancient Mesopotamia (3500-539 BCE)',
    'Ancient Egypt (3100-30 BCE)',
    'Indus Valley Civilization (3300-1300 BCE)',
    'Ancient China - Shang/Zhou (1600-221 BCE)',
    'Classical Antiquity - Mediterranean (800 BCE-600 CE)',
    'Mayan Classical Period (250-900 CE)',
    'Islamic Golden Age (8th-13th Century)',
    'Medieval Europe (500-1500 CE)',
    'Medieval Japan - Heian/Kamakura (794-1333 CE)',
    'Aztec Empire (1345-1521 CE)',
    'Ming Dynasty China (1368-1644 CE)',
    'Mughal Empire India (1526-1857 CE)',
    'Renaissance Europe (1400-1600 CE)',
    'Age of Exploration (1400-1600 CE)',
    'Edo Period Japan (1603-1868 CE)',
    'Enlightenment Era (1650-1800 CE)',
    'Industrial Revolution (1760-1840 CE)',
    'Victorian Era (1837-1901 CE)',
    'Meiji Restoration (1868-1912 CE)',
    'Belle Époque (1871-1914 CE)',
    'Interwar Period (1918-1939 CE)',
    'Post-WWII Era (1945-1991 CE)',
    'Digital Age (1991-2010 CE)',
    'Contemporary Era (2010-Present)',
    'Near Future (2025-2100 CE)',
    'Far Future (2100+ CE)',
    'Post-Apocalyptic Timeline',
    'Alternate History Branch',
    'Mythological Time'
  ];

  const narrativeGenres = [
    { id: 'historical', label: 'Historical Fiction', icon: '🏛️' },
    { id: 'fantasy', label: 'Fantasy', icon: '🧝' },
    { id: 'sci-fi', label: 'Science Fiction', icon: '🛸' },
    { id: 'mythological', label: 'Mythological', icon: '🌀' },
    { id: 'speculative', label: 'Speculative Fiction', icon: '💡' },
    { id: 'surreal', label: 'Surreal / Abstract', icon: '👁️' },
    { id: 'horror', label: 'Horror / Gothic', icon: '🌙' },
    { id: 'mystery', label: 'Mystery / Thriller', icon: '🔍' },
    { id: 'romance', label: 'Romance', icon: '💕' },
    { id: 'adventure', label: 'Adventure', icon: '⚔️' },
    { id: 'dystopian', label: 'Dystopian', icon: '🌆' },
    { id: 'steampunk', label: 'Steampunk', icon: '⚙️' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: '🤖' },
    { id: 'urban-fantasy', label: 'Urban Fantasy', icon: '🌃' },
    { id: 'magical-realism', label: 'Magical Realism', icon: '✨' },
    { id: 'post-apocalyptic', label: 'Post-Apocalyptic', icon: '☢️' },
    { id: 'space-opera', label: 'Space Opera', icon: '🌌' },
    { id: 'alternate-history', label: 'Alternate History', icon: '🌍' },
    { id: 'superhero', label: 'Superhero', icon: '🦸' },
    { id: 'western', label: 'Western', icon: '🤠' },
    { id: 'noir', label: 'Noir', icon: '🎭' },
    { id: 'comedy', label: 'Comedy', icon: '😄' },
    { id: 'slice-of-life', label: 'Slice of Life', icon: '☕' },
    { id: 'bildungsroman', label: 'Coming of Age', icon: '🌱' },
    { id: 'hybrid', label: 'Hybrid / Cross-Genre', icon: '🧬' }
  ];

  const compileForHistoricalCreator = (data: CreativeCharacterData) => {
    const finalArchetype = data.archetype === 'Custom' ? customArchetype : data.archetype;
    const genreLabels = data.genres.map(g => {
      if (g.startsWith('custom:')) {
        return g.replace('custom:', '');
      }
      return narrativeGenres.find(opt => opt.id === g)?.label || g;
    }).join(', ');

    // Create a comprehensive description for the historical character creator
    const compiledDescription = `${data.description}

Character Context:
- Archetype: ${finalArchetype}
- Era: ${data.era}
- Location: ${data.location}
- Narrative Genres: ${genreLabels}

This character was created through the Creative Character Genesis process and represents a ${finalArchetype} archetype in ${data.era}. They exist in a world influenced by ${genreLabels} themes.`;

    // Navigate to historical character creator with pre-filled data
    const searchParams = new URLSearchParams({
      prefill: 'true',
      description: compiledDescription,
      location: data.location,
      era: data.era,
      source: 'creative-genesis'
    });

    navigate(`/characters/create/historical?${searchParams.toString()}`);
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

  const handleGenreToggle = (genreId: string) => {
    const newGenres = formData.genres.includes(genreId)
      ? formData.genres.filter(g => g !== genreId)
      : [...formData.genres, genreId];
    
    setFormData({ ...formData, genres: newGenres });
  };

  const addCustomGenre = () => {
    if (newCustomGenre.trim() && !customGenres.includes(newCustomGenre.trim())) {
      const newGenres = [...customGenres, newCustomGenre.trim()];
      setCustomGenres(newGenres);
      setFormData({ ...formData, genres: [...formData.genres, `custom:${newCustomGenre.trim()}`] });
      setNewCustomGenre('');
    }
  };

  const removeCustomGenre = (genre: string) => {
    const customGenreKey = `custom:${genre}`;
    setCustomGenres(customGenres.filter(g => g !== genre));
    setFormData({ ...formData, genres: formData.genres.filter(g => g !== customGenreKey) });
  };

  const handleRandomize = () => {
    switch (currentStep) {
      case 1:
        setFormData({ ...formData, identityType: Math.random() > 0.5 ? 'human' : 'multi-species' });
        break;
      case 2:
        const archetypes = formData.identityType === 'human' ? humanArchetypes : multiSpeciesArchetypes;
        const validArchetypes = archetypes.filter(a => a.value !== 'Custom');
        setFormData({ ...formData, archetype: validArchetypes[Math.floor(Math.random() * validArchetypes.length)].value });
        setCustomArchetype('');
        break;
      case 3:
        setFormData({ 
          ...formData, 
          era: globalEras[Math.floor(Math.random() * globalEras.length)],
          location: 'Random location based on era'
        });
        break;
      case 4:
        const predefinedGenres = narrativeGenres.filter(g => g.id !== 'hybrid');
        const randomGenres = predefinedGenres
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
      case 2: return formData.archetype !== '' || customArchetype.trim() !== '';
      case 3: return formData.era !== '' && formData.location !== '';
      case 4: return formData.genres.length > 0;
      case 5: return formData.description.length >= 50;
      default: return false;
    }
  };

  const handleComplete = () => {
    const finalData = {
      ...formData,
      archetype: formData.archetype === 'Custom' ? customArchetype : formData.archetype
    };

    // If it's a humanoid character, compile and send to Historical Character creator
    if (formData.identityType === 'human') {
      compileForHistoricalCreator(finalData);
      onOpenChange(false);
    } else {
      // For multi-species, use the original creative character flow
      onComplete(finalData);
      onOpenChange(false);
    }
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
        const currentArchetypes = formData.identityType === 'human' ? humanArchetypes : multiSpeciesArchetypes;
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">What broad kind of mind or role does this character represent?</h3>
              <p className="text-muted-foreground">Choose an archetype that defines their core nature and drives.</p>
            </div>
            
            <div className="space-y-4">
              <Select 
                value={formData.archetype} 
                onValueChange={(value) => {
                  setFormData({ ...formData, archetype: value });
                  if (value !== 'Custom') {
                    setCustomArchetype('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an archetype..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {currentArchetypes.map((archetype) => (
                    <SelectItem key={archetype.value} value={archetype.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{archetype.value}</span>
                        <span className="text-xs text-muted-foreground">{archetype.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formData.archetype === 'Custom' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom Archetype</Label>
                  <Input
                    placeholder="Enter your custom archetype (e.g., Time-Traveling Librarian, Quantum Bard)"
                    value={customArchetype}
                    onChange={(e) => setCustomArchetype(e.target.value)}
                  />
                </div>
              )}
              
              {formData.archetype && formData.archetype !== 'Custom' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>{formData.archetype}:</strong> {currentArchetypes.find(a => a.value === formData.archetype)?.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                  <SelectContent className="max-h-[300px]">
                    {globalEras.map((era) => (
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
                    ? 'e.g., The Silk Road trading posts, Feudal Japanese countryside, Victorian London, Maasai territories in Kenya'
                    : 'e.g., On the Red Spiral moons during the Collapse, Between universe cycles, Inside a fractured Dyson lattice'
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
              <h3 className="text-xl font-semibold">What narrative genres does this character belong to?</h3>
              <p className="text-muted-foreground">Select genres that define their world's tone and style. You can choose multiple.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
              {narrativeGenres.map((genre) => (
                <div
                  key={genre.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.genres.includes(genre.id)
                      ? 'border-primary bg-primary/10'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleGenreToggle(genre.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{genre.icon}</span>
                    <span className="text-sm font-medium">{genre.label}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add Custom Genre</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Biopunk, Solarpunk, Weird West"
                  value={newCustomGenre}
                  onChange={(e) => setNewCustomGenre(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomGenre()}
                />
                <Button onClick={addCustomGenre} disabled={!newCustomGenre.trim()}>
                  Add
                </Button>
              </div>
            </div>
            
            {(formData.genres.length > 0 || customGenres.length > 0) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Genres:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.genres.map((genreId) => {
                    if (genreId.startsWith('custom:')) {
                      const customGenre = genreId.replace('custom:', '');
                      return (
                        <Badge key={genreId} variant="secondary" className="flex items-center gap-1">
                          🎨 {customGenre}
                          <button
                            onClick={() => removeCustomGenre(customGenre)}
                            className="ml-1 text-xs hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    } else {
                      const genre = narrativeGenres.find(g => g.id === genreId);
                      return (
                        <Badge key={genreId} variant="secondary">
                          {genre?.icon} {genre?.label}
                        </Badge>
                      );
                    }
                  })}
                </div>
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
                placeholder="What drives them? What kind of world do they live in? What is their place in that world? What challenges do they face? What are their goals or desires?"
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
                <p><strong>Archetype:</strong> {formData.archetype === 'Custom' ? customArchetype : formData.archetype}</p>
                <p><strong>Era:</strong> {formData.era}</p>
                <p><strong>Location:</strong> {formData.location}</p>
                <p><strong>Genres:</strong> {formData.genres.map(g => {
                  if (g.startsWith('custom:')) {
                    return g.replace('custom:', '');
                  }
                  return narrativeGenres.find(opt => opt.id === g)?.label;
                }).join(', ')}</p>
              </div>
              
              {formData.identityType === 'human' && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  <strong>Note:</strong> This humanoid character will be sent to the Historical Character creator for detailed trait generation.
                </div>
              )}
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
              {formData.identityType === 'human' ? 'Create Historical Character' : 'Create Character'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreativeCharacterDialog;
