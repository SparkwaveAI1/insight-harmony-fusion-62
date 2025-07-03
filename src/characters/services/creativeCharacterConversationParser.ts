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
      description: this.extractCoreDescription(description),
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
    // Enhanced patterns for structured format
    const structuredPatterns = [
      /\*\*Character Name\*\*:\s*([A-Za-z][A-Za-z\s'-]{1,30})/i,
      /Character Name:\s*([A-Za-z][A-Za-z\s'-]{1,30})/i,
    ];

    // Try structured patterns first
    for (const pattern of structuredPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        console.log('Extracted structured name:', name);
        return name;
      }
    }

    // Fallback patterns
    const fallbackPatterns = [
      /Name:\s*([A-Za-z][A-Za-z\s'-]{1,30})/i,
      /(?:called|named)\s+([A-Z][a-z]{2,15})/i,
      /^([A-Z][a-z]{2,15})\s+(?:is|was|has|can)/m,
    ];

    for (const pattern of fallbackPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate name
        const invalidWords = ['character', 'description', 'what', 'who', 'where', 'when', 'how'];
        if (!invalidWords.some(word => name.toLowerCase().includes(word))) {
          console.log('Extracted fallback name:', name);
          return name;
        }
      }
    }

    return '';
  }

  private static extractEntityType(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for structured format first
    const structuredMatch = desc.match(/\*\*entity type\*\*:\s*(human|non_humanoid)/i);
    if (structuredMatch) {
      console.log('Extracted structured entity type:', structuredMatch[1]);
      return structuredMatch[1];
    }

    // Strong non-human indicators
    const nonHumanIndicators = [
      'non_humanoid', 'non-humanoid', 'alien', 'creature', 'entity', 'being',
      'energy form', 'ethereal', 'spirit', 'ghost', 'demon', 'angel',
      'robot', 'android', 'ai', 'artificial', 'mechanical',
      'shapeshifter', 'transform', 'manifest'
    ];
    
    // Strong human indicators
    const humanIndicators = [
      'person', 'man', 'woman', 'human', 'spy', 'agent', 'soldier',
      'years old', 'age', 'born', 'childhood', 'family',
      'job', 'work', 'profession', 'career'
    ];
    
    const nonHumanScore = nonHumanIndicators.filter(indicator => desc.includes(indicator)).length;
    const humanScore = humanIndicators.filter(indicator => desc.includes(indicator)).length;
    
    const result = nonHumanScore > humanScore ? 'non_humanoid' : 'human';
    console.log('Extracted entity type via scoring:', result, { nonHumanScore, humanScore });
    return result;
  }

  private static extractNarrativeDomain(description: string): string {
    const desc = description.toLowerCase();
    
    // Look for structured format first
    const structuredMatch = desc.match(/\*\*narrative domain\*\*:\s*(modern|sci-fi|fantasy|horror|surreal)/i);
    if (structuredMatch) {
      console.log('Extracted structured narrative domain:', structuredMatch[1]);
      return structuredMatch[1];
    }
    
    // Domain scoring
    const domains = {
      'sci-fi': ['sci-fi', 'science fiction', 'future', 'space', 'technology', 'cyberpunk', 'android', 'ai'],
      'fantasy': ['fantasy', 'magic', 'medieval', 'dragon', 'wizard', 'spell', 'enchanted'],
      'horror': ['horror', 'dark', 'scary', 'nightmare', 'demon', 'ghost', 'evil'],
      'surreal': ['surreal', 'dream', 'bizarre', 'strange', 'abstract', 'distortion'],
      'modern': ['modern', 'contemporary', 'city', 'urban', 'current', 'today', 'present']
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
    
    console.log('Extracted narrative domain via scoring:', bestDomain);
    return bestDomain;
  }

  private static extractEnvironment(description: string): string {
    // Look for structured format first
    const structuredMatch = description.match(/\*\*Environment\*\*:\s*([^\n*]{10,200})/i);
    if (structuredMatch) {
      console.log('Extracted structured environment:', structuredMatch[1].trim());
      return structuredMatch[1].trim();
    }

    // Fallback patterns
    const patterns = [
      /environment[:\s]*([^.\n]{10,100})/i,
      /setting[:\s]*([^.\n]{10,100})/i,
      /(?:lives?|operates?|works?)\s+in\s+([^.\n]{10,100})/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const env = match[1].trim();
        if (env.length > 5) {
          console.log('Extracted environment:', env);
          return env;
        }
      }
    }

    return 'Contemporary setting';
  }

  private static extractPhysicalForm(description: string): string {
    // Look for structured format first
    const structuredMatch = description.match(/\*\*Physical Form\*\*:\s*([^\n*]{10,300})/i);
    if (structuredMatch) {
      console.log('Extracted structured physical form:', structuredMatch[1].trim());
      return structuredMatch[1].trim();
    }

    // Fallback patterns
    const patterns = [
      /physical form[:\s]*([^.\n]{10,200})/i,
      /appearance[:\s]*([^.\n]{10,200})/i,
      /looks? like[:\s]*([^.\n]{10,100})/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const form = match[1].trim();
        if (form.length > 10) {
          console.log('Extracted physical form:', form);
          return form;
        }
      }
    }
    
    return 'Human form';
  }

  private static extractCommunication(description: string): string {
    // Look for structured format first
    const structuredMatch = description.match(/\*\*Communication\*\*:\s*([^\n*]{5,100})/i);
    if (structuredMatch) {
      console.log('Extracted structured communication:', structuredMatch[1].trim());
      return structuredMatch[1].trim();
    }

    // Fallback patterns
    const patterns = [
      /communication[:\s]*([^.\n]{5,100})/i,
      /speaks?\s+([^.\n]{5,100})/i,
      /voice[:\s]*([^.\n]{5,100})/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        const comm = match[1].trim();
        console.log('Extracted communication:', comm);
        return comm;
      }
    }
    
    return 'Verbal communication';
  }

  private static extractCoreDescription(description: string): string {
    // Look for structured format first
    const structuredMatch = description.match(/\*\*Core Description\*\*:\s*([^\n*]{20,500})/i);
    if (structuredMatch) {
      console.log('Extracted structured core description');
      return structuredMatch[1].trim();
    }

    // If no structured format, return the whole description but cleaned
    const cleaned = description
      .replace(/\*\*[^*]+\*\*:/g, '') // Remove field labels
      .replace(/[\n\r]+/g, ' ') // Replace newlines with spaces
      .trim();
    
    console.log('Using cleaned full description as core description');
    return cleaned || description;
  }

  private static extractSurfaceTriggers(description: string): string[] {
    const triggers: string[] = [];
    
    // Look for structured format first
    const structuredMatch = description.match(/\*\*Surface Triggers\*\*:\s*([^\n*]{5,200})/i);
    if (structuredMatch) {
      const triggerText = structuredMatch[1].trim();
      // Split by common separators
      const splitTriggers = triggerText.split(/[,;]/).map(t => t.trim()).filter(t => t.length > 0);
      triggers.push(...splitTriggers);
      console.log('Extracted structured surface triggers:', triggers);
      return triggers;
    }

    // Fallback pattern matching
    const triggerPatterns = [
      /(?:fears?|afraid of|scared of)[:\s]*([^.\n]{5,100})/gi,
      /(?:triggers?|triggered by)[:\s]*([^.\n]{5,100})/gi,
      /(?:weaknesses?|weak to)[:\s]*([^.\n]{5,100})/gi,
    ];
    
    for (const pattern of triggerPatterns) {
      const matches = [...description.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          triggers.push(match[1].trim());
        }
      });
    }
    
    if (triggers.length === 0) {
      triggers.push('Emotional complexity');
    }
    
    console.log('Extracted surface triggers:', triggers);
    return [...new Set(triggers)]; // Remove duplicates
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
