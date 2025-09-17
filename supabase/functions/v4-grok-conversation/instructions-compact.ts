// Compact instruction builder for v4-grok-conversation
// Parallel to the main builder, controlled by feature flags

export function buildV4CompactInstructions(summary: any, fullProfile: any, userInput: string) {
  const lp = fullProfile?.communication_style?.lexical_profile ?? {};
  const vf = fullProfile?.communication_style?.voice_foundation ?? {};
  const ra = fullProfile?.communication_style?.response_architecture ?? {};

  const dj = (lp.domain_jargon ?? []).slice(0,6);
  const hedges = (lp.hedging_language ?? []).slice(0,3);

  // small helpers (implement next step)
  const mot = top3Motivations(summary);
  const traits = pickDominantTraits(summary.selected_traits ?? [], fullProfile, 6)
    .map((t: any) => `${t.trait}: ${shortVal(t.data_value)} (${shortReason(t.relevance_reason)})`);

  const style = {
    dir: vf.directness_level,
    form: vf.formality_default,
    pace: vf.pace_rhythm,
    len: vocabToLen(lp.vocabulary_level),
    dig: personaToDigressProb(fullProfile),
    selfcorr: personaToSelfCorrectProb(fullProfile),
    story: personaToStoryProb(fullProfile),
    humor: personaToHumorProb(fullProfile),
    contr: personaToContradictProb(fullProfile),
    lexMin: 2,
    pattern: ra?.opinion_structure ?? "context_nuance_conclusion"
  };

  const prompt = {
    ctx: {
      study: "Qual research; give a direct opinion in 2–4 sentences.",
      rules: ["no disclaimers","no CV","stay on topic"],
      ban: ["In my experience","To begin with","Let's consider the data"]
    },
    q: userInput,
    id: {
      n: summary?.demographics?.name,
      a: summary?.demographics?.age,
      loc: summary?.demographics?.location,
      occ: summary?.demographics?.occupation
    },
    lang: { dir: style.dir, form: style.form, pace: style.pace, hedge: hedges, dj },
    mot,
    traits,
    kb: {
      knows: (fullProfile?.knowledge_profile?.expertise_domains ?? []).slice(0,3),
      uncertain: (fullProfile?.knowledge_profile?.knowledge_gaps ?? []).slice(0,2)
    },
    style
  };

  return JSON.stringify(prompt);
}

// Helper functions
function top3Motivations(summary: any): string[] {
  const motivations = summary?.motivation_profile ?? {};
  const entries = Object.entries(motivations)
    .filter(([key, val]) => typeof val === 'number' && val > 6)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([key]) => key.replace(/_/g, ' '));
  
  return entries.length > 0 ? entries : ['achievement', 'security', 'relationships'];
}

function pickDominantTraits(selectedTraits: any[], fullProfile: any, limit: number): any[] {
  // If selectedTraits exist, use those; otherwise extract from fullProfile
  if (selectedTraits && selectedTraits.length > 0) {
    return selectedTraits.slice(0, limit);
  }

  // Fallback: extract key traits from fullProfile
  const traits: any[] = [];
  
  if (fullProfile?.inhibitor_profile?.confidence_level) {
    traits.push({
      trait: 'confidence_level',
      data_value: fullProfile.inhibitor_profile.confidence_level,
      relevance_reason: 'core personality trait'
    });
  }
  
  if (fullProfile?.emotional_profile?.positive_triggers) {
    traits.push({
      trait: 'positive_triggers',
      data_value: fullProfile.emotional_profile.positive_triggers,
      relevance_reason: 'emotional response pattern'
    });
  }
  
  if (fullProfile?.communication_style?.voice_foundation?.directness_level) {
    traits.push({
      trait: 'directness_level',
      data_value: fullProfile.communication_style.voice_foundation.directness_level,
      relevance_reason: 'communication style'
    });
  }

  return traits.slice(0, limit);
}

function shortVal(value: any): string {
  if (typeof value === 'string') {
    return value.length > 30 ? `${value.slice(0, 27)}...` : value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 2).join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).slice(0, 2).join(', ');
  }
  return String(value);
}

function shortReason(reason: string): string {
  if (!reason) return 'relevant';
  return reason.length > 15 ? `${reason.slice(0, 12)}...` : reason;
}

function vocabToLen(vocabLevel: string): string {
  switch (vocabLevel?.toLowerCase()) {
    case 'high':
    case 'advanced':
      return 'long';
    case 'low':
    case 'basic':
      return 'short';
    default:
      return 'medium';
  }
}

function personaToDigressProb(fullProfile: any): number {
  const personality = fullProfile?.personality_contradictions;
  const attention = fullProfile?.inhibitor_profile?.attention_span;
  
  if (personality || attention === 'short') return 0.4;
  if (attention === 'long') return 0.1;
  return 0.2;
}

function personaToSelfCorrectProb(fullProfile: any): number {
  const perfectionism = fullProfile?.inhibitor_profile?.perfectionism;
  const confidence = fullProfile?.inhibitor_profile?.confidence_level;
  
  if (perfectionism === 'high') return 0.4;
  if (confidence === 'low') return 0.3;
  if (confidence === 'high') return 0.1;
  return 0.2;
}

function personaToStoryProb(fullProfile: any): number {
  const storytelling = fullProfile?.communication_style?.response_architecture?.storytelling_structure;
  const cultural = fullProfile?.cultural_background?.narrative_style;
  
  if (storytelling === 'narrative' || cultural === 'story-driven') return 0.5;
  if (storytelling === 'analytical') return 0.1;
  return 0.3;
}

function personaToHumorProb(fullProfile: any): number {
  const humor = fullProfile?.communication_style?.humor_style;
  const formality = fullProfile?.communication_style?.voice_foundation?.formality_default;
  
  if (humor && humor !== 'none') return 0.3;
  if (formality === 'formal') return 0.05;
  if (formality === 'casual') return 0.2;
  return 0.1;
}

function personaToContradictProb(fullProfile: any): number {
  const contradictions = fullProfile?.personality_contradictions;
  const complexity = fullProfile?.cognitive_style?.thinking_complexity;
  
  if (contradictions) return 0.4;
  if (complexity === 'complex') return 0.2;
  return 0.1;
}