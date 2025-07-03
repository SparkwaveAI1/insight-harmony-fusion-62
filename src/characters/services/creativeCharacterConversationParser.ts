
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
    // Improved name extraction patterns with better validation
    const namePatterns = [
      /\*\*Character Name\*\*:\s*([A-Z][a-zA-Z\s'-]+)/i,
      /Character Name:\s*([A-Z][a-zA-Z\s'-]+)/i,
      /Name:\s*([A-Z][a-zA-Z\s'-]+)/i,
      /^([A-Z][a-z]+)\s+is\s+a/m,
      /(?:meet|introducing|called?|named?)\s+([A-Z][a-zA-Z\s'-]+)/i,
      /^#\s*([A-Z][a-zA-Z\s'-]+)/m,
      /^\*\*([A-Z][a-zA-Z\s'-]+)\*\*/m
    ];

    for (const pattern of namePatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Improved validation - reject common non-name words and ensure reasonable length
        const invalidWords = ['character', 'description', 'comprehensive', 'personality', 'entity', 'here', 'this', 'that'];
        const isValidName = name.length <= 50 && 
                          name.length >= 2 &&
                          !invalidWords.some(word => name.toLowerCase().includes(word)) &&
                          !/^\d/.test(name) && // doesn't start with number
                          /^[A-Z]/.test(name); // starts with capital letter
        
        if (isValidName) {
          console.log('Extracted name:', name);
          return name;
        }
      }
    }

    // Fallback: look for proper nouns at the beginning of sentences
    const sentences = description.split(/[.!?]+/);
    for (const sentence of sentences.slice(0, 3)) { // Check first 3 sentences
      const words = sentence.trim().split(/\s+/);
      for (const word of words.slice(0, 3)) { // Check first 3 words of each sentence
        if (/^[A-Z][a-z]{2,15}$/.test(word) && 
            !['The', 'This', 'Here', 'Character', 'Entity'].includes(word)) {
          console.log('Fallback extracted name:', word);
          return word;
        }
      }
    }

    return '';
  }

  private static extractEntityType(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for explicit entity type declarations first
    const entityTypeMatch = desc.match(/entity type[:\s]*([a-z_\s]+)/i);
    if (entityTypeMatch) {
      const entityType = entityTypeMatch[1].trim();
      if (entityType.includes('human')) return 'human';
      if (entityType.includes('non') || entityType.includes('humanoid')) return 'non_humanoid';
    }
    
    // Strong human indicators - prioritize these
    const humanIndicators = [
      'spy', 'hero', 'person', 'man', 'woman', 'girl', 'boy',
      'mid-20s', 'age', 'years old', 'human being',
      'seductive', 'attractive', 'charming', 'skilled at',
      'operates in', 'works as', 'profession'
    ];
    
    const nonHumanoidIndicators = [
      'coil', 'crystalline', 'translucent', 'vapor', 'energy being',
      'fluid consciousness', 'amorphous', 'non-corporeal',
      'alien', 'creature', 'beast', 'monster', 'entity',
      'manifests as', 'composed of', 'ethereal'
    ];
    
    // Count indicators
    const humanScore = humanIndicators.filter(indicator => desc.includes(indicator)).length;
    const nonHumanScore = nonHumanoidIndicators.filter(indicator => desc.includes(indicator)).length;
    
    // Human wins ties since most character descriptions are human
    if (humanScore >= nonHumanScore) {
      return 'human';
    }
    
    return 'non_humanoid';
  }

  private static extractNarrativeDomain(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for explicit narrative domain declarations
    const domainMatch = desc.match(/narrative domain[:\s]*([a-z\s/()-]+)/i);
    if (domainMatch) {
      const domain = domainMatch[1].trim();
      if (domain.includes('modern')) return 'modern';
      if (domain.includes('sci-fi') || domain.includes('science')) return 'sci-fi';
      if (domain.includes('fantasy')) return 'fantasy';
      if (domain.includes('horror')) return 'horror';
      if (domain.includes('surreal')) return 'surreal';
    }
    
    // Domain indicators with scoring
    const domains = {
      'modern': ['modern', 'contemporary', 'city', 'urban', 'spy', 'current', 'present day', '21st century', 'today'],
      'sci-fi': ['sci-fi', 'science fiction', 'space', 'future', 'technology', 'cyberpunk', 'futuristic'],
      'fantasy': ['fantasy', 'magic', 'medieval', 'dragon', 'wizard', 'enchanted', 'mystical'],
      'horror': ['horror', 'dark', 'scary', 'creepy', 'haunted', 'nightmare', 'terror'],
      'surreal': ['surreal', 'abstract', 'dream', 'bizarre', 'strange', 'weird', 'unusual']
    };
    
    let bestDomain = 'modern';
    let bestScore = 0;
    
    for (const [domain, indicators] of Object.entries(domains)) {
      const score = indicators.filter(indicator => desc.includes(indicator)).length;
      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    }
    
    return bestDomain;
  }

  private static extractEnvironment(description: string): string {
    // Look for environment/setting descriptions with better context awareness
    const envPatterns = [
      /(?:operating|works?|lives?|set|takes place|environment|setting|world)[:\s]+in\s+([^.,!?]+)/i,
      /(?:within|inside|throughout)\s+(a\s+[^.,!?]{10,50})/i,
      /environment[:\s]*([^.,!?]{10,100})/i,
      /setting[:\s]*([^.,!?]{10,100})/i
    ];

    for (const pattern of envPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const env = match[1].trim();
        // Validate environment description
        if (env.length > 5 && env.length < 200 && 
            !env.includes('her conscience') && 
            !env.includes('weighs heavily')) {
          return env;
        }
      }
    }

    // Fallback based on narrative domain and key terms
    const desc = description.toLowerCase();
    if (desc.includes('city') || desc.includes('urban')) {
      return 'Modern urban environment';
    }
    if (desc.includes('space') || desc.includes('future')) {
      return 'Futuristic setting';
    }
    if (desc.includes('fantasy') || desc.includes('medieval')) {
      return 'Fantasy realm';
    }
    if (desc.includes('horror') || desc.includes('dark')) {
      return 'Dark atmosphere';
    }

    return 'Contemporary setting';
  }

  private static extractPhysicalForm(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for explicit physical descriptions
    const physicalPatterns = [
      /physical appearance[:\s]*([^.]{20,200})/i,
      /appearance[:\s]*([^.]{20,200})/i,
      /looks? like[:\s]*([^.]{10,100})/i,
      /is\s+(strikingly|remarkably|notably)\s+([^.]{10,100})/i
    ];

    for (const pattern of physicalPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const form = match[1].trim();
        if (form.length > 10 && !form.includes('her conscience')) {
          return form;
        }
      }
    }
    
    // Categorize based on descriptive terms
    if (desc.includes('attractive') || desc.includes('beautiful') || desc.includes('handsome')) {
      return 'Attractive human appearance';
    }
    if (desc.includes('tall') || desc.includes('athletic') || desc.includes('slender')) {
      return 'Athletic human build';
    }
    if (desc.includes('mid-20s') || desc.includes('young')) {
      return 'Young adult human';
    }
    if (desc.includes('massive') || desc.includes('giant') || desc.includes('large')) {
      return 'Large-scale entity';
    }
    if (desc.includes('coil') || desc.includes('translucent') || desc.includes('energy')) {
      return 'Non-corporeal manifestation';
    }
    
    return 'Human form';
  }

  private static extractCommunication(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for communication style descriptions
    const commPatterns = [
      /communication[:\s]*([^.]{10,100})/i,
      /speaks? with[:\s]*([^.]{10,100})/i,
      /voice[:\s]*([^.]{10,100})/i
    ];

    for (const pattern of commPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Categorize based on communication indicators
    if (desc.includes('banter') || desc.includes('charm') || desc.includes('wit') ||
        desc.includes('seductive') || desc.includes('empathy')) {
      return 'Charismatic verbal communication';
    }
    if (desc.includes('telepathic') || desc.includes('psychic') || desc.includes('mind')) {
      return 'Telepathic communication';
    }
    if (desc.includes('bioluminescent') || desc.includes('glowing') || desc.includes('pulse')) {
      return 'Bioluminescent signaling';
    }
    if (desc.includes('gesture') || desc.includes('movement')) {
      return 'Gestural communication';
    }
    
    return 'Verbal communication';
  }

  private static extractSurfaceTriggers(description: string): string[] {
    const triggers: string[] = [];
    const desc = description.toLowerCase();
    
    // Look for fears, weaknesses, and emotional responses
    const triggerPatterns = [
      /fears?[:\s]*([^.]{10,200})/i,
      /weaknesses?[:\s]*([^.]{10,200})/i,
      /triggers?[:\s]*([^.]{10,200})/i,
      /vulnerable to[:\s]*([^.]{10,100})/i,
      /struggles? with[:\s]*([^.]{10,100})/i
    ];
    
    for (const pattern of triggerPatterns) {
      const matches = description.match(new RegExp(pattern, 'gi'));
      if (matches) {
        matches.forEach(match => {
          const triggerMatch = match.match(pattern);
          if (triggerMatch && triggerMatch[1]) {
            triggers.push(triggerMatch[1].trim());
          }
        });
      }
    }
    
    // Look for specific emotional and behavioral triggers
    if (desc.includes('paranoia') || desc.includes('vulnerable') || desc.includes('suspicious')) {
      triggers.push('Paranoia and vulnerability');
    }
    if (desc.includes('guilt') || desc.includes('conscience') || desc.includes('moral burden')) {
      triggers.push('Guilt and moral conflict');
    }
    if (desc.includes('isolation') || desc.includes('lonely') || desc.includes('disconnected')) {
      triggers.push('Fear of isolation');
    }
    if (desc.includes('memory') || desc.includes('forget') || desc.includes('erase')) {
      triggers.push('Memory-related anxiety');
    }
    if (desc.includes('trust') || desc.includes('betrayal') || desc.includes('manipulation')) {
      triggers.push('Trust and betrayal issues');
    }
    if (desc.includes('identity') || desc.includes('who am i') || desc.includes('sense of self')) {
      triggers.push('Identity crisis concerns');
    }
    
    return triggers.length > 0 ? [...new Set(triggers)] : ['Emotional complexity'];
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
        desc.includes('adjust') || desc.includes('resilient')) {
      return 'mutate_adapt';
    }
    if (desc.includes('withdraw') || desc.includes('collapse') || desc.includes('retreat')) {
      return 'collapse_destabilize';
    }
    if (desc.includes('resist') || desc.includes('suppress') || desc.includes('deny')) {
      return 'suppress_contradiction';
    }
    
    return 'mutate_adapt'; // Default for adaptable characters
  }
}
