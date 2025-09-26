// New trait analysis engine that actually works with real trait data
export class TraitAnalysisEngine {
  
  static extractRelevantTraits(userQuestion: string, fullProfile: any): Array<{trait: string, data_value: any, relevance: number}> {
    const allTraits: Array<{trait: string, data_value: any}> = [];
    const questionWords = userQuestion.toLowerCase().split(/\s+/);
    
    // Extract EVERY trait from the full profile
    function extractAllTraits(obj: any, path = '') {
      if (!obj || typeof obj !== 'object') return;
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          extractAllTraits(value, currentPath);
        } else if (value !== null && value !== undefined) {
          allTraits.push({ trait: currentPath, data_value: value });
        }
      }
    }
    
    extractAllTraits(fullProfile);
    
    // Score relevance for this specific question
    const scoredTraits = allTraits.map(trait => ({
      ...trait,
      relevance: this.calculateRelevanceScore(trait, questionWords, userQuestion)
    }));
    
    // Return top 8 most relevant traits
    return scoredTraits
      .filter(t => t.relevance > 0.2)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 8);
  }
  
  static calculateRelevanceScore(trait: {trait: string, data_value: any}, questionWords: string[], userQuestion: string): number {
    let score = 0;
    const traitName = trait.trait.toLowerCase();
    const question = userQuestion.toLowerCase();
    
    // Technology/AI relevance
    if (question.includes('ai') || question.includes('technology') || question.includes('artificial intelligence')) {
      if (traitName.includes('risk') || traitName.includes('adoption') || traitName.includes('innovation')) score += 0.8;
      if (traitName.includes('openness') || traitName.includes('conservative')) score += 0.6;
      if (traitName.includes('loss_aversion') || traitName.includes('overconfidence')) score += 0.5;
    }
    
    // Business/work relevance
    if (question.includes('business') || question.includes('work') || question.includes('professional')) {
      if (traitName.includes('mastery') || traitName.includes('conscientiousness')) score += 0.7;
      if (traitName.includes('authority') || traitName.includes('hierarchy')) score += 0.5;
    }
    
    // General trait relevance based on numeric values
    if (typeof trait.data_value === 'number') {
      if (trait.data_value > 0.7 || trait.data_value < 0.3) {
        score += 0.4; // Extreme values are more relevant
      }
    }
    
    return Math.min(score, 1.0);
  }
  
  static synthesizeQualitativeOpinion(relevantTraits: Array<{trait: string, data_value: any}>, userQuestion: string): string {
    const traits: Record<string, any> = {};
    relevantTraits.forEach(t => {
      traits[t.trait] = t.data_value;
    });
    
    // Check for specific trait combinations and generate opinions
    if (traits['adoption_profile.risk_tolerance'] && traits['adoption_profile.risk_tolerance'] < 0.4 && 
        traits['bias_profile.cognitive.loss_aversion'] && traits['bias_profile.cognitive.loss_aversion'] > 0.7) {
      return "Based on your low risk tolerance and high loss aversion, you think this poses significant implementation risks that outweigh potential benefits";
    }
    
    if (traits['motivation_profile.primary_drivers.mastery'] && traits['motivation_profile.primary_drivers.mastery'] > 0.7) {
      return "Based on your high mastery motivation, you're excited about the technical possibilities but concerned about maintaining your expertise edge";
    }
    
    if (traits['behavioral_economics.loss_aversion'] && traits['behavioral_economics.loss_aversion'] > 0.7) {
      return "Based on your high loss aversion, you focus primarily on what could go wrong and the potential downsides";
    }
    
    if (traits['big_five.openness'] && traits['big_five.openness'] < 0.3) {
      return "Based on your preference for conventional approaches, you're skeptical of new technologies and prefer proven methods";
    }
    
    if (traits['big_five.openness'] && traits['big_five.openness'] > 0.7) {
      return "Based on your high openness, you're genuinely excited by innovation and see the creative possibilities";
    }
    
    if (traits['extended_traits.institutional_trust'] && traits['extended_traits.institutional_trust'] < 0.4) {
      return "Based on your low institutional trust, you're suspicious of corporate claims and want to see independent verification";
    }
    
    // Business owner specific
    if (traits['identity.occupation'] && typeof traits['identity.occupation'] === 'string' && 
        traits['identity.occupation'].toLowerCase().includes('owner')) {
      return "Based on your business ownership experience, you evaluate this primarily through ROI lens and liability risk";
    }
    
    // Healthcare professional specific  
    if (traits['identity.occupation'] && typeof traits['identity.occupation'] === 'string' && 
        (traits['identity.occupation'].toLowerCase().includes('doctor') || 
         traits['identity.occupation'].toLowerCase().includes('physician'))) {
      return "Based on your medical training, you prioritize patient safety and evidence-based approaches over technological novelty";
    }
    
    // Default fallback - but make it more specific
    return "You approach this with cautious optimism, weighing practical implementation against potential risks";
  }
  
  static synthesizeCommunicationStyle(relevantTraits: Array<{trait: string, data_value: any}>, fullProfile: any): string {
    const traits: Record<string, any> = {};
    relevantTraits.forEach(t => {
      traits[t.trait] = t.data_value;
    });
    
    let style = "";
    
    // Get basic demographics for context - safely handle location object/string
    const occupation = fullProfile?.identity?.occupation || '';
    const loc = fullProfile?.identity?.location;
    const locationText = typeof loc === 'string' ? loc.toLowerCase() : 
        [loc?.city, loc?.region, loc?.country].filter(Boolean).join(' ').toLowerCase();
    const nationality = (fullProfile?.identity?.nationality || '').toLowerCase();
    
    // Cultural/Regional influence
    if (nationality.includes('bulgari') || locationText.includes('miami')) {
      style += "Channel your Bulgarian immigrant entrepreneur perspective - lead with ROI concerns and implementation costs. Use Eastern European directness to cut through marketing hype. ";
    }
    
    // Professional context
    if (occupation.toLowerCase().includes('owner') || occupation.toLowerCase().includes('business')) {
      style += "Reference your business operational constraints and liability concerns. Focus sharply on practical bottom-line impact. ";
    }
    
    if (occupation.toLowerCase().includes('doctor') || occupation.toLowerCase().includes('physician')) {
      style += "Draw on your medical training perspective - emphasize evidence-based evaluation and patient safety considerations. ";
    }
    
    // Trait-based style modifications
    if (traits['big_five.agreeableness'] && traits['big_five.agreeableness'] < 0.4) {
      style += "Express your opinions directly without diplomatic softening. ";
    }
    
    if (traits['extended_traits.truth_orientation'] && traits['extended_traits.truth_orientation'] > 0.7) {
      style += "Prioritize accuracy and cut straight to what you actually think without social pleasantries. ";
    }
    
    if (traits['behavioral_economics.overconfidence'] && traits['behavioral_economics.overconfidence'] > 0.6) {
      style += "Express your views with confidence and certainty. ";
    }
    
    if (traits['big_five.neuroticism'] && traits['big_five.neuroticism'] > 0.6) {
      style += "Show concern about potential problems and express skepticism about overly optimistic claims. ";
    }
    
    // Response length preference
    if (traits['communication_style.default_output_length'] === 'brief') {
      style += "Keep responses short and to-the-point. ";
    }
    
    return style || "Respond authentically based on your natural communication patterns and professional background.";
  }
}