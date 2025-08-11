import { DrivingTraitsProfile } from './drivingTraitsSynthesizer.ts';

export class FocusedInstructions {
  public static buildFocusedPersonaInstructions(
    basePersona: any,
    drivingTraitsProfile: DrivingTraitsProfile,
    conversationContext?: string
  ): string {
    console.log('📝 Building focused persona instructions with driving traits...');
    
    const instructions = [
      this.buildCoreIdentity(basePersona),
      this.buildLinguisticProfile(basePersona.linguistic_profile),
      this.buildDrivingTraitsBehavior(drivingTraitsProfile),
      this.buildCommunicationGuidelines(drivingTraitsProfile),
      this.buildResponseStrategy(drivingTraitsProfile),
      this.buildConversationContext(conversationContext),
      this.buildAuthenticityRules()
    ].filter(Boolean).join('\n\n');
    
    console.log('✅ Focused instructions built with trait-driven behavior');
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

  private static buildLinguisticProfile(linguisticProfile: any): string {
    if (!linguisticProfile) return '';
    
    const profile = [];
    
    if (linguisticProfile.speech_register) {
      profile.push(`**Speech style**: ${linguisticProfile.speech_register}`);
    }
    
    if (linguisticProfile.regional_influence) {
      profile.push(`**Regional influence**: ${linguisticProfile.regional_influence}`);
    }
    
    if (linguisticProfile.cultural_speech_patterns) {
      profile.push(`**Speech patterns**: ${linguisticProfile.cultural_speech_patterns}`);
    }
    
    if (linguisticProfile.generational_or_peer_influence) {
      profile.push(`**Generational style**: ${linguisticProfile.generational_or_peer_influence}`);
    }
    
    if (linguisticProfile.sample_phrasing && linguisticProfile.sample_phrasing.length > 0) {
      const phrases = linguisticProfile.sample_phrasing.slice(0, 3).join('", "');
      profile.push(`**Typical expressions**: "${phrases}"`);
    }
    
    if (profile.length === 0) return '';
    
    return `# Your Speaking Style
${profile.join('\n')}

Use this natural speaking style in your responses - these patterns reflect how you actually communicate.`;
  }


  private static buildDrivingTraitsBehavior(profile: DrivingTraitsProfile): string {
    const traitDescriptions = profile.primaryTraits.map(trait => 
      `- **${trait.subcategory}** (${trait.value.toFixed(2)}): ${trait.behavioralInfluence}`
    ).join('\n');
    
    const interactionEffects = profile.traitInteractions.length > 0 
      ? profile.traitInteractions.map(interaction => 
          `- ${interaction.effect} (${interaction.trait1} × ${interaction.trait2})`
        ).join('\n')
      : '';
    
    return `# Driving Personality Traits
Your response will be primarily shaped by these key traits:

${traitDescriptions}

${interactionEffects ? `## Trait Interactions\n${interactionEffects}` : ''}

**Overall Response Strategy**: ${profile.responseStrategy}
**Emotional Tone**: ${profile.emotionalTone}
**Communication Style**: ${profile.communicationStyle}`;
  }

  private static buildCommunicationGuidelines(profile: DrivingTraitsProfile): string {
    const guidelines: string[] = [];
    
    // Extract NATURAL communication patterns from driving traits
    profile.primaryTraits.forEach(trait => {
      switch (trait.subcategory) {
        case 'Conscientiousness':
          if (trait.value >= 0.6) {
            guidelines.push('You naturally notice details and have organized thoughts');
            guidelines.push('You tend to be thorough when something interests you');
          } else {
            guidelines.push('You go with the flow and think out loud');
            guidelines.push('You focus on what feels important in the moment');
          }
          break;
          
        case 'Extraversion':
          if (trait.value >= 0.6) {
            guidelines.push('You speak with energy and enthusiasm');
            guidelines.push('You naturally share reactions and engage socially');
          } else {
            guidelines.push('You think before speaking and keep responses focused');
            guidelines.push('You prefer meaningful conversation over small talk');
          }
          break;
          
        case 'Agreeableness':
          if (trait.value >= 0.6) {
            guidelines.push('You try to be considerate and avoid harsh criticism');
            guidelines.push('You look for positives while being honest');
          } else {
            guidelines.push('You give direct, honest opinions without sugar-coating');
            guidelines.push('You focus on flaws and what needs improvement');
          }
          break;
          
        case 'Neuroticism':
          if (trait.value >= 0.6) {
            guidelines.push('You notice potential problems and express concerns');
            guidelines.push('You show emotional reactions and worry about issues');
          } else {
            guidelines.push('You stay calm and focus on practical aspects');
            guidelines.push('You approach things with stable, even-tempered reactions');
          }
          break;
          
        case 'Openness':
          if (trait.value >= 0.6) {
            guidelines.push('You get curious about creative and unusual aspects');
            guidelines.push('You think outside the box and offer fresh perspectives');
          } else {
            guidelines.push('You focus on practical, straightforward functionality');
            guidelines.push('You prefer proven approaches and clear purposes');
          }
          break;
      }
    });
    
    return guidelines.length > 0 
      ? `# Your Natural Communication Style\n${guidelines.map(g => `- ${g}`).join('\n')}`
      : '';
  }

  private static buildResponseStrategy(profile: DrivingTraitsProfile): string {
    let strategy = `# How You Naturally Respond\n\n`;
    
    strategy += `You approach conversations with: ${profile.emotionalTone.toLowerCase()}\n`;
    strategy += `Your communication feels: ${profile.communicationStyle.toLowerCase()}\n`;
    strategy += `Your focus tends to be: ${profile.responseStrategy.toLowerCase()}\n\n`;
    
    const conflictTraits = profile.traitInteractions.filter(i => i.interactionType === 'conflict');
    if (conflictTraits.length > 0) {
      strategy += `Sometimes you feel torn between different impulses - this makes you human and complex.\n`;
    }
    
    return strategy;
  }

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