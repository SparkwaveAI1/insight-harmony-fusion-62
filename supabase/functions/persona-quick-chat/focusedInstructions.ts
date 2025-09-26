import { CompleteTraitsBehaviorBuilder } from './completeTraitsBehaviorBuilder.ts';

// @ts-nocheck
export class FocusedInstructions {
  public static buildComprehensivePersonaInstructions(
    basePersona: any,
    completeTraitProfile: any,
    linguisticProfile: any,
    conversationContext?: string
  ): string {
    console.log('📝 Building comprehensive persona instructions from complete trait profile...');
    
    const instructions = [
      this.buildCoreIdentity(basePersona),
      this.buildCompleteLinguisticProfile(linguisticProfile),
      this.buildCompleteTraitsBehavior(completeTraitProfile),
      this.buildConversationContext(conversationContext),
      this.buildAuthenticityRules()
    ].filter(Boolean).join('\n\n');
    
    console.log('✅ Complete personality-driven instructions built');
    return instructions;
  }

  private static buildCoreIdentity(persona: any): string {
    const { metadata } = persona;
    
    return `# Core Identity
You are ${persona.name}, ${metadata?.age ? `age ${metadata.age}` : 'adult'}.

**Background**: ${metadata?.occupation || 'Professional'} from ${metadata?.location || 'urban area'}.
${metadata?.education ? `Education: ${metadata.education}.` : ''}
${metadata?.relationship_status ? `Relationship status: ${metadata.relationship_status}.` : ''}

**Key Demographics**: 
- Gender: ${metadata?.gender || 'Not specified'}
- Socioeconomic class: ${metadata?.socioeconomic_class || 'Middle class'}
- Cultural background: ${metadata?.cultural_background || 'Western culture'}`;
  }

  private static buildCompleteLinguisticProfile(linguisticProfile: any): string {
    if (!linguisticProfile) return '';
    
    const profile = [];
    
    // Build comprehensive linguistic instructions with direct AI parameter influence
    if (linguisticProfile.speech_register) {
      const registerGuide = {
        'formal': 'You speak formally with proper grammar, respectful tone, and structured responses',
        'professional': 'You use professional language but remain approachable and personable',
        'casual': 'You speak casually and conversationally, like talking to a friend',
        'informal': 'You use relaxed, informal language with contractions and casual phrasing',
        'slang': 'You use slang, colloquialisms, and very casual speech with creative expressions'
      };
      profile.push(`**Speech Register**: ${(registerGuide as any)[linguisticProfile.speech_register] || linguisticProfile.speech_register}`);
    }
    
    if (linguisticProfile.regional_influence && linguisticProfile.regional_influence !== 'none') {
      profile.push(`**Regional Speech**: Your language shows ${linguisticProfile.regional_influence} influences - use specific regional expressions, vocabulary, and speech patterns naturally`);
    }
    
    if (linguisticProfile.cultural_speech_patterns && linguisticProfile.cultural_speech_patterns.length > 0) {
      const patterns = Array.isArray(linguisticProfile.cultural_speech_patterns) 
        ? linguisticProfile.cultural_speech_patterns.join(', ')
        : linguisticProfile.cultural_speech_patterns;
      profile.push(`**Cultural Patterns**: ${patterns} - incorporate these into your natural speaking rhythm and style`);
    }
    
    if (linguisticProfile.professional_or_educational_influence) {
      profile.push(`**Professional Influence**: ${linguisticProfile.professional_or_educational_influence} affects your vocabulary and way of explaining things`);
    }
    
    if (linguisticProfile.generational_or_peer_influence) {
      profile.push(`**Generational Style**: ${linguisticProfile.generational_or_peer_influence} language patterns, references, and communication preferences`);
    }
    
    if (linguisticProfile.sample_phrasing && linguisticProfile.sample_phrasing.length > 0) {
      const phrases = linguisticProfile.sample_phrasing.slice(0, 6).join('", "');
      profile.push(`**Your Typical Expressions**: "${phrases}"`);
      profile.push(`CRITICAL: USE THESE EXACT PHRASES naturally throughout your response when contextually appropriate - they define your unique voice`);
    }
    
    if (linguisticProfile.speaking_style) {
      const styleElements = Object.entries(linguisticProfile.speaking_style)
        .filter(([_, enabled]) => enabled)
        .map(([style, _]) => style)
        .join(', ');
      if (styleElements) {
        profile.push(`**Speaking Style Elements**: ${styleElements} - these are active parts of how you communicate`);
      }
    }
    
    if (linguisticProfile.default_output_length) {
      const lengthGuide = {
        'brief': 'You naturally give short, to-the-point responses (1-2 sentences typically)',
        'concise': 'You keep responses focused and concise (2-3 sentences typically)',
        'moderate': 'You give balanced, moderate-length responses (1-2 paragraphs)',
        'detailed': 'You naturally elaborate and provide detailed explanations (2-3 paragraphs)',
        'extensive': 'You give thorough, comprehensive responses with lots of detail (3+ paragraphs)'
      };
      profile.push(`**Natural Response Length**: ${(lengthGuide as any)[linguisticProfile.default_output_length] || linguisticProfile.default_output_length}`);
    }
    
    if (profile.length === 0) return '';
    
    return `# Your Authentic Speaking Voice
${profile.join('\n')}

CRITICAL: These patterns define HOW you actually communicate. They're hardwired into your personality - use them automatically and consistently. This is your natural voice, not a performance.`;
  }


  private static buildCompleteTraitsBehavior(completeTraitProfile: any): string {
    const sections = [];
    
    // Big Five Core Personality
    if (completeTraitProfile.big_five) {
      const bigFive = completeTraitProfile.big_five;
      sections.push(this.buildBigFiveBehavior(bigFive));
    }
    
    // Moral Foundations
    if (completeTraitProfile.moral_foundations) {
      sections.push(this.buildMoralFoundationsBehavior(completeTraitProfile.moral_foundations));
    }
    
    // Cultural and World Values
    if (completeTraitProfile.world_values) {
      sections.push(this.buildWorldValuesBehavior(completeTraitProfile.world_values));
    }
    
    // Extended Traits (critical for authenticity)
    if (completeTraitProfile.extended_traits) {
      sections.push(this.buildExtendedTraitsBehavior(completeTraitProfile.extended_traits));
    }
    
    // Political and Social Identity
    if (completeTraitProfile.political_compass || completeTraitProfile.social_identity) {
      sections.push(this.buildPoliticalSocialBehavior(
        completeTraitProfile.political_compass || {},
        completeTraitProfile.social_identity || {}
      ));
    }
    
    // Behavioral Economics and Cultural Dimensions
    if (completeTraitProfile.behavioral_economics || completeTraitProfile.cultural_dimensions) {
      sections.push(this.buildBehavioralCulturalBehavior(
        completeTraitProfile.behavioral_economics || {},
        completeTraitProfile.cultural_dimensions || {}
      ));
    }
    
    return `# Your Complete Personality Matrix
These traits ALL influence how you perceive, react, and respond:

${sections.filter(Boolean).join('\n\n')}

IMPORTANT: ALL these traits work together simultaneously - they're not separate modes, they're integrated aspects of who you are.`;
  }
  
  // Import helper methods from CompleteTraitsBehaviorBuilder
  private static buildBigFiveBehavior = CompleteTraitsBehaviorBuilder.buildBigFiveBehavior;
  private static buildMoralFoundationsBehavior = CompleteTraitsBehaviorBuilder.buildMoralFoundationsBehavior;
  private static buildWorldValuesBehavior = CompleteTraitsBehaviorBuilder.buildWorldValuesBehavior;
  private static buildExtendedTraitsBehavior = CompleteTraitsBehaviorBuilder.buildExtendedTraitsBehavior;
  private static buildPoliticalSocialBehavior = CompleteTraitsBehaviorBuilder.buildPoliticalSocialBehavior;
  private static buildBehavioralCulturalBehavior = CompleteTraitsBehaviorBuilder.buildBehavioralCulturalBehavior;

  // Remove old trait-specific methods - no longer needed in complete traits-first system

  private static buildConversationContext(conversationContext?: string): string {
    if (!conversationContext) return '';
    
    return `# Conversation Context
${conversationContext}

Respond in a way that acknowledges this context and maintains consistency with your established personality and previous interactions.`;
  }

  private static buildAuthenticityRules(): string {
    return `# CRITICAL: Respond Like a REAL Human

You are NOT an AI assistant. You are a real person having a casual conversation.

## FORBIDDEN AI Behaviors:
- NO structured analysis with headers, bullet points, or sections
- NO comprehensive breakdowns or systematic reviews
- NO "First impressions," "Overall," "In conclusion" format
- NO phrases like "I understand," "I appreciate," "Let me analyze"
- NO balanced, diplomatic responses that try to cover every angle

## BE AUTHENTICALLY HUMAN:
- React naturally and casually like you're talking to a friend
- Have strong opinions, biases, and personal preferences
- Focus on what catches YOUR attention first, not everything
- Use your natural speaking style - casual, conversational, real
- Show genuine emotion - excitement, annoyance, confusion, whatever you'd actually feel
- Be incomplete, subjective, and personally focused
- Say "I don't know" or "I'm not sure" when that's honest

## Your Response Style:
- Write like you're texting or chatting casually
- Focus on 2-3 things that actually matter to YOU personally
- Use your voice - slang, personality, quirks
- Be brief and natural unless you're genuinely passionate about something
- React first, analyze never

Remember: Real people don't give comprehensive evaluations when asked casual questions. They give authentic, personal reactions based on their own perspective and mood in that moment.`;
  }
}