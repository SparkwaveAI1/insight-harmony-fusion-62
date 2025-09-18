// Normalizes V4 persona profiles to match the validator’s expected schema
// Minimal, defensive transforms only – no content changes, just structure/coercion

export function normalizeV4PersonaProfile(input: any): any {
  if (!input || typeof input !== 'object') return input;
  const profile = structuredClone(input);

  // 1) prompt_shaping: drop disallowed keys
  const allowedPromptShapingKeys = [
    'voice_foundation', 'style_markers', 'primary_motivations', 'deal_breakers',
    'honesty_vector', 'bias_vector', 'context_switches', 'current_focus'
  ];
  if (profile.prompt_shaping && typeof profile.prompt_shaping === 'object') {
    Object.keys(profile.prompt_shaping).forEach((k) => {
      if (!allowedPromptShapingKeys.includes(k)) {
        delete profile.prompt_shaping[k];
      }
    });
  }

  // 2) humor_profile: coerce string fields to arrays when required by schema
  if (profile.humor_profile && typeof profile.humor_profile === 'object') {
    const arrayish = ['style', 'boundaries', 'targets', 'use_cases'];
    arrayish.forEach((key) => {
      const v = profile.humor_profile[key];
      if (typeof v === 'string' && v.trim()) profile.humor_profile[key] = [v.trim()];
      if (v == null) profile.humor_profile[key] = [];
    });
  }

  // 3) truth_honesty_profile: coerce to expected shapes
  if (profile.truth_honesty_profile && typeof profile.truth_honesty_profile === 'object') {
    const thp = profile.truth_honesty_profile;

    // baseline_honesty: string → number
    const mapLevel = (x: string) => {
      const t = (x || '').toLowerCase();
      if (t.includes('high')) return 0.8;
      if (t.includes('moderate') || t.includes('medium')) return 0.5;
      if (t.includes('low')) return 0.2;
      const n = Number(x);
      return isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.6;
    };
    if (typeof thp.baseline_honesty === 'string') thp.baseline_honesty = mapLevel(thp.baseline_honesty);
    if (typeof thp.baseline_honesty !== 'number') thp.baseline_honesty = 0.6;

    // situational_variance: string → { work, home, public }
    if (typeof thp.situational_variance === 'string') {
      const v = mapLevel(thp.situational_variance);
      thp.situational_variance = { work: v, home: v, public: v };
    }
    if (!thp.situational_variance || typeof thp.situational_variance !== 'object') {
      thp.situational_variance = { work: 0.6, home: 0.6, public: 0.6 };
    }

    // arrays: typical_distortions, red_lines, pressure_points
    ['typical_distortions', 'red_lines', 'pressure_points'].forEach((k) => {
      const v = thp[k];
      if (typeof v === 'string' && v.trim()) thp[k] = [v.trim()];
      if (v == null) thp[k] = [];
    });

    if (typeof thp.confession_style !== 'string') thp.confession_style = '';
  }

  // 4) bias_profile: map cognitive_biases (descriptive) → cognitive (numeric placeholders)
  if (profile.bias_profile && typeof profile.bias_profile === 'object') {
    const bp = profile.bias_profile;
    if (!bp.cognitive && bp.cognitive_biases && typeof bp.cognitive_biases === 'object') {
      const toNum = (desc: any) => {
        if (typeof desc !== 'string') return 0.5;
        const t = desc.toLowerCase();
        if (t.includes('high') || t.includes('strong')) return 0.8;
        if (t.includes('low') || t.includes('rare')) return 0.2;
        if (t.includes('moderate') || t.includes('occasion')) return 0.5;
        return 0.5;
      };
      const src = bp.cognitive_biases;
      bp.cognitive = {
        status_quo: toNum(src.status_quo),
        loss_aversion: toNum(src.loss_aversion),
        confirmation: toNum(src.confirmation),
        anchoring: toNum(src.anchoring),
        availability: toNum(src.availability),
        optimism: toNum(src.optimism),
        sunk_cost: toNum(src.sunk_cost),
        overconfidence: 0.5,
      };
    }
    if (!Array.isArray(bp.mitigations)) {
      bp.mitigations = bp.mitigations ? [bp.mitigations] : [];
    }
  }

  // 5) guard identity fields that validator hard-stops on
  if (profile.identity && typeof profile.identity === 'object') {
    if (!profile.identity.education_level) profile.identity.education_level = '';
    if (!profile.identity.income_bracket) profile.identity.income_bracket = '';
    if (!profile.identity.location) profile.identity.location = {} as any;
    if (!profile.identity.location.urbanicity) profile.identity.location.urbanicity = '';
  }

  // 6) daily_life.primary_activities hours sanity: coerce strings → numbers
  if (profile.daily_life?.primary_activities) {
    const a = profile.daily_life.primary_activities;
    Object.keys(a).forEach((k) => {
      const v = a[k];
      if (typeof v === 'string') {
        const n = parseFloat(v);
        a[k] = isFinite(n) ? n : 0;
      }
    });
  }

  return profile;
}
