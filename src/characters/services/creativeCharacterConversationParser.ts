
import { CreativeCharacterData } from '../types/creativeCharacterTypes';

export class CreativeCharacterConversationParser {
  /**
   * Parses a compiled character description and extracts CreativeCharacterData
   */
  static parseCharacterDescription(description: string): CreativeCharacterData {
    console.log('Parsing character description:', description);

    // Extract key information using improved patterns and keywords
    const name = this.extractName(description);
    const entityType = this.extractEntityType(description);
    const narrativeDomain = this.extractNarrativeDomain(description);
    const environment = this.extractEnvironment(description);
    const physicalForm = this.extractPhysicalForm(description);
    const communication = this.extractCommunication(description);
    const surfaceTriggers = this.extractSurfaceTriggers(description);

    const characterData: CreativeCharacterData = {
      name: name || 'Unnamed Character',
      entityType: entityType,
      narrativeDomain: narrativeDomain,
      functionalRole: this.extractFunctionalRole(description),
      description: description,
      environment: environment,
      physicalForm: physicalForm,
      communication: communication,
      surfaceTriggers: surfaceTriggers,
      changeResponseStyle: this.extractChangeResponseStyle(description)
    };

    console.log('Parsed character data:', characterData);
    return characterData;
  }

  private static extractName(description: string): string {
    // Improved name extraction patterns
    const namePatterns = [
      /\*\*Character Name\*\*:\s*([A-Z][a-zA-Z\s]+)/i, // **Character Name**: Lyra
      /Character Name:\s*([A-Z][a-zA-Z\s]+)/i, // Character Name: Lyra
      /(?:^|\n)([A-Z][a-z]+)\s+is\s+a/m, // "Lyra is a" at start of line
      /(?:named?|called?)\s+([A-Z][a-zA-Z]+)/i, // "named Lyra" or "called Lyra"
      /Character:?\s*([A-Z][a-zA-Z\s]+)/i, // Character: Lyra
      /Name:?\s*([A-Z][a-zA-Z\s]+)/i // Name: Lyra
    ];

    for (const pattern of namePatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate the name (should be reasonable length and not contain common non-name words)
        if (name.length <= 50 && !name.toLowerCase().includes('comprehensive') && 
            !name.toLowerCase().includes('description') && !name.toLowerCase().includes('character')) {
          return name;
        }
      }
    }

    return '';
  }

  private static extractEntityType(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for explicit entity type declarations first
    if (desc.includes('entity type**: human') || desc.includes('entity type: human')) {
      return 'human';
    }
    
    // Check for human indicators
    if (desc.includes('human') || desc.includes('person') || desc.includes('man') || 
        desc.includes('woman') || desc.includes('spy') || desc.includes('hero') ||
        desc.includes('mid-20s') || desc.includes('age') || desc.includes('attractive') ||
        desc.includes('seductive') || desc.includes('banter')) {
      return 'human';
    }
    
    // Check for non-human indicators
    if (desc.includes('coil') || desc.includes('crystalline') || 
        desc.includes('translucent') || desc.includes('vapor') ||
        desc.includes('energy being') || desc.includes('fluid') ||
        desc.includes('non-humanoid') || desc.includes('alien') ||
        desc.includes('creature') || desc.includes('entity')) {
      return 'non_humanoid';
    }
    
    if (desc.includes('post-biological') || desc.includes('consciousness') ||
        desc.includes('digital') || desc.includes('ai')) {
      return 'post_biological';
    }
    
    // Default to human for character descriptions that don't specify otherwise
    return 'human';
  }

  private static extractNarrativeDomain(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for explicit narrative domain declarations
    if (desc.includes('narrative domain**: modern') || desc.includes('narrative domain: modern')) {
      return 'modern';
    }
    
    if (desc.includes('sci-fi') || desc.includes('science fiction') || 
        desc.includes('space') || desc.includes('future') || 
        desc.includes('technology') || desc.includes('cyberpunk')) {
      return 'sci-fi';
    }
    
    if (desc.includes('fantasy') || desc.includes('magic') || 
        desc.includes('medieval') || desc.includes('dragon') ||
        desc.includes('wizard') || desc.includes('enchanted')) {
      return 'fantasy';
    }
    
    if (desc.includes('horror') || desc.includes('dark') || 
        desc.includes('scary') || desc.includes('creepy')) {
      return 'horror';
    }
    
    if (desc.includes('surreal') || desc.includes('abstract') || 
        desc.includes('dream') || desc.includes('bizarre')) {
      return 'surreal';
    }
    
    if (desc.includes('modern') || desc.includes('contemporary') || 
        desc.includes('present day') || desc.includes('city') || 
        desc.includes('urban') || desc.includes('spy') || desc.includes('superhero')) {
      return 'modern';
    }
    
    // Default to modern for realistic character descriptions
    return 'modern';
  }

  private static extractEnvironment(description: string): string {
    // Look for environment/setting descriptions
    const envPatterns = [
      /operating in\s+([^.,!?]+)/i, // "operating in a modern city"
      /set in\s+([^.,!?]+)/i, // "set in a dystopian future"
      /takes place in\s+([^.,!?]+)/i, // "takes place in..."
      /environment[:\s]+([^.,!?]+)/i, // "Environment: urban setting"
      /setting[:\s]+([^.,!?]+)/i, // "Setting: modern city"
      /world[:\s]+([^.,!?]+)/i // "World: cyberpunk landscape"
    ];

    for (const pattern of envPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const env = match[1].trim();
        if (env.length > 5 && env.length < 200) {
          return env;
        }
      }
    }

    // Fallback to extracting from narrative domain context
    const desc = description.toLowerCase();
    if (desc.includes('city') || desc.includes('urban')) {
      return 'Modern urban environment';
    }
    if (desc.includes('space') || desc.includes('future')) {
      return 'Futuristic setting';
    }
    if (desc.includes('forest') || desc.includes('nature')) {
      return 'Natural environment';
    }

    return 'Contemporary setting';
  }

  private static extractPhysicalForm(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for explicit physical descriptions
    if (desc.includes('strikingly attractive') || desc.includes('beautiful') || 
        desc.includes('handsome') || desc.includes('appearance')) {
      return 'Attractive human form';
    }
    
    if (desc.includes('tall') || desc.includes('short') || desc.includes('athletic') ||
        desc.includes('slender') || desc.includes('muscular')) {
      return 'Human physical form';
    }
    
    if (desc.includes('massive') || desc.includes('giant') || desc.includes('large')) {
      return 'Large scale entity';
    }
    
    if (desc.includes('tiny') || desc.includes('small') || desc.includes('miniature')) {
      return 'Small scale entity';
    }
    
    if (desc.includes('human') || desc.includes('person') || desc.includes('mid-20s')) {
      return 'Human-sized';
    }
    
    return 'Human form';
  }

  private static extractCommunication(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for communication style descriptions
    if (desc.includes('banter') || desc.includes('charm') || desc.includes('wit') ||
        desc.includes('seductive') || desc.includes('empathy') || desc.includes('voice')) {
      return 'Verbal and emotional communication';
    }
    
    if (desc.includes('telepathic') || desc.includes('psychic') || 
        desc.includes('mind') || desc.includes('thought')) {
      return 'Telepathic communication';
    }
    
    if (desc.includes('bioluminescent') || desc.includes('glowing') || 
        desc.includes('light') || desc.includes('pulse')) {
      return 'Bioluminescent pulses';
    }
    
    if (desc.includes('gesture') || desc.includes('movement') || desc.includes('dance')) {
      return 'Gestural communication';
    }
    
    return 'Verbal communication';
  }

  private static extractSurfaceTriggers(description: string): string[] {
    const triggers: string[] = [];
    const desc = description.toLowerCase();
    
    // Look for emotional and behavioral triggers
    if (desc.includes('paranoia') || desc.includes('fear') || desc.includes('vulnerable')) {
      triggers.push('Paranoia and vulnerability');
    }
    
    if (desc.includes('guilt') || desc.includes('conscience') || desc.includes('moral')) {
      triggers.push('Guilt and moral conflict');
    }
    
    if (desc.includes('isolation') || desc.includes('lonely') || desc.includes('solitude')) {
      triggers.push('Fear of isolation');
    }
    
    if (desc.includes('memory') || desc.includes('forget') || desc.includes('erase')) {
      triggers.push('Memory manipulation concerns');
    }
    
    if (desc.includes('trust') || desc.includes('betrayal') || desc.includes('manipulation')) {
      triggers.push('Trust and betrayal issues');
    }
    
    if (desc.includes('threat') || desc.includes('danger') || desc.includes('protective')) {
      triggers.push('Threat detection');
    }
    
    return triggers.length > 0 ? triggers : ['Emotional complexity'];
  }

  private static extractFunctionalRole(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('spy') || desc.includes('infiltration') || desc.includes('espionage')) {
      return 'spy_operative';
    }
    
    if (desc.includes('hero') || desc.includes('protector') || desc.includes('defender')) {
      return 'guardian_entity';
    }
    
    if (desc.includes('oracle') || desc.includes('seer') || desc.includes('prophet')) {
      return 'oracle_interpreter';
    }
    
    if (desc.includes('ritual') || desc.includes('ceremony') || desc.includes('sacred')) {
      return 'ritual_coordinator';
    }
    
    if (desc.includes('guide') || desc.includes('navigator') || desc.includes('dimension')) {
      return 'dimensional_navigator';
    }
    
    return 'protagonist_agent';
  }

  private static extractChangeResponseStyle(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('adapt') || desc.includes('flexible') || desc.includes('evolve') ||
        desc.includes('adjust') || desc.includes('change')) {
      return 'mutate_adapt';
    }
    
    if (desc.includes('collapse') || desc.includes('withdraw') || desc.includes('destabilize')) {
      return 'collapse_destabilize';
    }
    
    if (desc.includes('suppress') || desc.includes('resist') || desc.includes('contradict')) {
      return 'suppress_contradiction';
    }
    
    return 'mutate_adapt'; // Default for characters who need to adapt and survive
  }
}
