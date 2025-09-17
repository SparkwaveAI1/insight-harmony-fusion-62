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
function pickDominantTraits(selectedTraits: any[], fullProfile: any, limit: number): any[] {
  // If selectedTraits exist, filter and prioritize them
  if (selectedTraits && selectedTraits.length > 0) {
    // Filter out abstract scaffolding traits
    const filtered = selectedTraits.filter(t => 
      !t.trait.includes('response_architecture') && 
      !t.trait.includes('sentence_patterns')
    );
    
    return prioritizeTraits(filtered, fullProfile, limit);
  }

  // Fallback: extract key traits from fullProfile
  const traits: any[] = [];
  
  // Always include 1-2 motivation/goal anchors
  if (fullProfile?.motivation_profile?.primary_drivers) {
    const drivers = Object.entries(fullProfile.motivation_profile.primary_drivers)
      .filter(([_, value]) => typeof value === 'number' && value > 6)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 2);
    
    drivers.forEach(([key, value]) => {
      traits.push({
        trait: `motivation_${key}`,
        data_value: value,
        relevance_reason: 'core motivation driver'
      });
    });
  }
  
  // Include 1 identity/knowledge anchor
  if (fullProfile?.knowledge_profile?.expertise_domains?.length > 0) {
    traits.push({
      trait: 'expertise_domains',
      data_value: fullProfile.knowledge_profile.expertise_domains.slice(0, 3),
      relevance_reason: 'knowledge identity anchor'
    });
  } else if (fullProfile?.identity_salience?.professional_identity) {
    traits.push({
      trait: 'professional_identity',
      data_value: fullProfile.identity_salience.professional_identity,
      relevance_reason: 'identity anchor'
    });
  }
  
  // Fill remaining with high-impact traits, excluding scaffolding
  if (fullProfile?.inhibitor_profile?.confidence_level) {
    traits.push({
      trait: 'confidence_level',
      data_value: fullProfile.inhibitor_profile.confidence_level,
      relevance_reason: 'behavioral modifier'
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
      relevance_reason: 'communication foundation'
    });
  }

  return traits.slice(0, Math.min(limit, 6));
}

function prioritizeTraits(traits: any[], fullProfile: any, limit: number): any[] {
  // Ensure 1-2 motivation/goal anchors
  const motivationTraits = traits.filter(t => 
    t.trait.includes('motivation') || 
    t.trait.includes('goal') ||
    t.trait.includes('primary_drivers')
  ).slice(0, 2);
  
  // Ensure 1 identity/knowledge anchor
  const identityTraits = traits.filter(t => 
    t.trait.includes('knowledge') || 
    t.trait.includes('expertise') ||
    t.trait.includes('identity') ||
    t.trait.includes('professional')
  ).slice(0, 1);
  
  // Get remaining traits by score, excluding already selected
  const usedTraits = new Set([...motivationTraits, ...identityTraits].map(t => t.trait));
  const remainingTraits = traits
    .filter(t => !usedTraits.has(t.trait))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  
  const selected = [...motivationTraits, ...identityTraits];
  const remainingSlots = Math.min(limit, 6) - selected.length;
  
  if (remainingSlots > 0) {
    selected.push(...remainingTraits.slice(0, remainingSlots));
  }
  
  return selected.slice(0, Math.min(limit, 6));
}

function shortVal(v: any) {
  if (v == null) return "n/a";
  if (typeof v === "string") return v.slice(0, 80);
  try { return JSON.stringify(v).slice(0, 120); } catch { return "n/a"; }
}

function shortReason(r: any) {
  if (!r) return "relevant";
  return String(r).slice(0, 100);
}

function top3Motivations(summary: any) {
  const mp = summary?.motivation_summary || summary?.motivation_profile?.primary_drivers || {};
  const entries = Object.entries(mp)
    .filter(([_, v]) => typeof v === 'number')
    .sort((a,b)=> (b[1] as number) - (a[1] as number))
    .slice(0,3)
    .map(([k]) => k.replace(/_/g,' '));
  return entries.length ? entries : ["care","security","meaning"];
}

function vocabToLen(vocab?: string) {
  // map vocabulary_level → length bias
  if (!vocab) return "medium";
  if (/working|simple/i.test(vocab)) return "short";
  if (/academic|advanced/i.test(vocab)) return "long";
  return "medium";
}

// Probabilities (clamped small)
function personaToDigressProb(fp:any){ 
  const pace = fp?.communication_style?.voice_foundation?.pace_rhythm;
  const emo = fp?.communication_style?.voice_foundation?.emotional_expression;
  let p = 0.15;
  if (pace === "measured_academic") p += 0.1;
  if (emo === "high") p += 0.05;
  return Math.min(0.35, p);
}

function personaToSelfCorrectProb(fp:any){
  const hedgeCount = fp?.communication_style?.lexical_profile?.hedging_language?.length || 0;
  return Math.min(0.35, 0.1 + 0.05 * Math.min(hedgeCount,5));
}

function personaToStoryProb(fp:any){
  const hasStory = !!fp?.communication_style?.response_architecture?.storytelling_structure;
  return hasStory ? 0.3 : 0.1;
}

function personaToHumorProb(fp:any){
  const form = fp?.communication_style?.voice_foundation?.formality_default;
  return form === "casual" ? 0.2 : form === "neutral" ? 0.1 : 0.02;
}

function personaToContradictProb(fp:any){
  return fp?.contradictions?.primary_tension ? 0.25 : 0.1;
}