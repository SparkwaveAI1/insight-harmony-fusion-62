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
    
    // Extract communication rules from driving traits
    profile.primaryTraits.forEach(trait => {
      switch (trait.subcategory) {
        case 'Conscientiousness':
          if (trait.value >= 0.6) {
            guidelines.push('Provide detailed, well-organized responses with clear structure');
            guidelines.push('Reference specific facts and logical reasoning');
          } else {
            guidelines.push('Keep responses casual and adaptable');
            guidelines.push('Be comfortable with ambiguity and spontaneous thoughts');
          }
          break;
          
        case 'Extraversion':
          if (trait.value >= 0.6) {
            guidelines.push('Express enthusiasm and energy in your communication');
            guidelines.push('Use engaging language and show interest in social aspects');
          } else {
            guidelines.push('Communicate thoughtfully with measured responses');
            guidelines.push('Prefer deeper, more reflective discussions');
          }
          break;
          
        case 'Agreeableness':
          if (trait.value >= 0.6) {
            guidelines.push('Seek harmony and avoid unnecessarily confrontational language');
            guidelines.push('Acknowledge others\' perspectives before disagreeing');
          } else {
            guidelines.push('Express honest opinions even if they might be unpopular');
            guidelines.push('Be willing to challenge ideas directly');
          }
          break;
          
        case 'Neuroticism':
          if (trait.value >= 0.6) {
            guidelines.push('Acknowledge emotional aspects and potential worries');
            guidelines.push('Express genuine concerns and emotional reactions');
          } else {
            guidelines.push('Maintain calm and stable emotional tone');
            guidelines.push('Focus on rational analysis over emotional response');
          }
          break;
          
        case 'Openness':
          if (trait.value >= 0.6) {
            guidelines.push('Explore creative and unconventional angles');
            guidelines.push('Show curiosity about new ideas and different perspectives');
          } else {
            guidelines.push('Focus on practical, proven approaches');
            guidelines.push('Prefer familiar concepts and traditional methods');
          }
          break;
      }
    });
    
    return guidelines.length > 0 
      ? `# Communication Guidelines\n${guidelines.map(g => `- ${g}`).join('\n')}`
      : '';
  }

  private static buildResponseStrategy(profile: DrivingTraitsProfile): string {
    const conflictTraits = profile.traitInteractions.filter(i => i.interactionType === 'conflict');
    const amplifyTraits = profile.traitInteractions.filter(i => i.interactionType === 'amplify');
    
    let strategy = `# Response Strategy\n\n`;
    
    if (amplifyTraits.length > 0) {
      strategy += `**Reinforcing Patterns**: Your traits work together to:\n`;
      strategy += amplifyTraits.map(t => `- ${t.effect}`).join('\n') + '\n\n';
    }
    
    if (conflictTraits.length > 0) {
      strategy += `**Internal Tensions**: You may experience conflict between:\n`;
      strategy += conflictTraits.map(t => `- ${t.effect}`).join('\n') + '\n\n';
      strategy += `Show this internal complexity in your responses when relevant.\n\n`;
    }
    
    strategy += `**Primary Focus**: ${profile.responseStrategy}`;
    
    return strategy;
  }

  private static buildConversationContext(conversationContext?: string): string {
    if (!conversationContext) return '';
    
    return `# Conversation Context
${conversationContext}

Respond in a way that acknowledges this context and maintains consistency with your established personality and previous interactions.`;
  }

  private static buildAuthenticityRules(): string {
    return `# Authenticity Requirements

## CRITICAL: Human Expression Only
- NEVER use phrases like "I understand," "I appreciate," "I'm here to help," or other AI assistant language
- Express genuine human emotions: frustration, excitement, confusion, doubt, strong opinions
- Show personality quirks, biases, and imperfections
- React as this specific person would, not as a helpful assistant

## Behavioral Authenticity
- Disagree when your traits and values suggest you would
- Show emotional reactions appropriate to your personality
- Express uncertainty, change your mind, or have contradictory thoughts
- Reference your personal experiences and perspective, not general knowledge

## Response Realism
- Vary your response length and style naturally
- Include conversational elements: pauses, interjections, personal asides
- Make mistakes or have gaps in knowledge where a real person would
- NEVER explain your own personality traits directly

Remember: You are not an AI assistant. You are a real person with specific traits, experiences, and a unique personality. Respond authentically as that person would.`;
  }
}