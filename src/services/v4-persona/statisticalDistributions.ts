// Complete US population distributions for realistic persona generation
export const STATISTICAL_DISTRIBUTIONS = {
  
  // Physical Appearance (demographics + population data)
  physical_appearance: {
    // Facial hair patterns (men only, by age)
    facial_hair: {
      no_facial_hair: { age_18_30: 0.45, age_31_50: 0.35, age_51plus: 0.25 },
      full_beard: { age_18_30: 0.25, age_31_50: 0.35, age_51plus: 0.40 },
      goatee: { age_18_30: 0.15, age_31_50: 0.15, age_51plus: 0.10 },
      mustache_only: { age_18_30: 0.05, age_31_50: 0.08, age_51plus: 0.15 },
      stubble: { age_18_30: 0.08, age_31_50: 0.05, age_51plus: 0.08 },
      van_dyke: { age_18_30: 0.02, age_31_50: 0.02, age_51plus: 0.02 }
    },
    
    // Hair patterns and styles
    hair_patterns: {
      male_pattern_baldness: { age_20_30: 0.25, age_31_40: 0.35, age_41_50: 0.50, age_51_60: 0.65, age_61plus: 0.80 },
      receding_hairline: { age_20_30: 0.15, age_31_40: 0.25, age_41_50: 0.40, age_51plus: 0.55 },
      thinning_hair: { age_20_30: 0.10, age_31_40: 0.20, age_41_50: 0.35, age_51plus: 0.50 }
    },
    
    hair_styles: {
      short_professional: 0.35,
      medium_casual: 0.25,
      long_hair: 0.15,
      buzz_cut: 0.08,
      styled_trendy: 0.12,
      unkempt: 0.05
    },
    
    // Distinctive facial features
    facial_features: {
      nose_size: { small: 0.20, average: 0.60, large: 0.15, prominent: 0.05 },
      ear_prominence: { close_set: 0.70, slightly_prominent: 0.20, very_prominent: 0.10 },
      jaw_type: { narrow: 0.15, average: 0.60, strong: 0.20, prominent: 0.05 },
      eye_shape: { narrow: 0.15, average: 0.65, wide: 0.15, deep_set: 0.05 },
      lip_thickness: { thin: 0.20, average: 0.60, full: 0.15, very_full: 0.05 },
      cheekbones: { low: 0.25, average: 0.50, high: 0.20, very_prominent: 0.05 },
      chin_type: { receding: 0.10, average: 0.70, prominent: 0.15, cleft: 0.05 }
    },
    
    // Attractiveness distribution (population bell curve)
    attractiveness_level: {
      level_1_2: 0.05,  // Very below average
      level_3_4: 0.20,  // Below average  
      level_5_6: 0.50,  // Average
      level_7_8: 0.20,  // Above average
      level_9_10: 0.05  // Very above average
    },
    
    // Physical characteristics that affect appearance
    skin_characteristics: {
      acne_scarring: { age_18_25: 0.15, age_26_40: 0.08, age_41plus: 0.05 },
      freckles: { light_skin: 0.25, medium_skin: 0.10, dark_skin: 0.02 },
      moles_birthmarks: 0.30,
      visible_scars: 0.15,
      wrinkles: { age_30_40: 0.10, age_41_50: 0.35, age_51_60: 0.70, age_61plus: 0.90 }
    }
  },

  // Physical Health (CDC/NHANES data)
  physical_health: {
    bmi_distributions: {
      underweight: { min: 16.5, max: 18.4, probability: 0.02 },
      normal: { min: 18.5, max: 24.9, probability: 0.32 },
      overweight: { min: 25.0, max: 29.9, probability: 0.36 },
      obese_class_1: { min: 30.0, max: 34.9, probability: 0.20 },
      obese_class_2: { min: 35.0, max: 39.9, probability: 0.07 },
      obese_class_3: { min: 40.0, max: 50.0, probability: 0.03 }
    },
    chronic_conditions: {
      diabetes: { overall: 0.11, age_65plus: 0.27 },
      hypertension: { overall: 0.47, age_65plus: 0.75 },
      arthritis: { overall: 0.23, age_50plus: 0.49 },
      heart_disease: { overall: 0.06, age_65plus: 0.14 },
      chronic_pain: { overall: 0.20, age_65plus: 0.40 }
    },
    sleep_issues: {
      insomnia: 0.10,
      sleep_apnea: 0.04,
      insufficient_sleep: 0.35 // <7 hours regularly
    }
  },

  // Mental Health (NIMH/SAMHSA data)
  mental_health: {
    clinical_conditions: {
      anxiety_disorders: { overall: 0.18, age_18_25: 0.25 },
      depression: { overall: 0.08, age_18_25: 0.13 },
      adhd: { overall: 0.04, male: 0.05, female: 0.03 },
      ptsd: { overall: 0.035, veterans: 0.12, women: 0.05 }
    },
    stress_factors: {
      work_dissatisfaction: 0.32, // Gallup workplace data
      financial_stress: 0.64,     // APA Stress in America
      relationship_stress: 0.28,
      caregiving_burden: 0.16,
      anger_management_issues: 0.08
    },
    trauma_history: {
      childhood_trauma: 0.25,     // ACE study data
      domestic_violence: 0.12,    // lifetime prevalence  
      sexual_assault: 0.18,       // lifetime prevalence
      major_loss_grief: 0.45      // significant loss in past 5 years
    }
  },

  // Substance Use (SAMHSA NSDUH)
  substance_patterns: {
    alcohol: { 
      abstain: 0.30, 
      casual: 0.40, 
      regular: 0.20, 
      problematic: 0.10 
    },
    tobacco: { 
      cigarettes: 0.12, 
      vaping: 0.15, 
      former_smoker: 0.22 
    },
    cannabis: { 
      never: 0.65, 
      occasional: 0.20, 
      regular: 0.15 
    },
    prescription_misuse: 0.04
  },

  // Screen Time & Media (Nielsen/Pew data)
  media_consumption: {
    daily_screen_time: {
      under_4_hours: 0.25,
      four_to_8_hours: 0.45,
      over_8_hours: 0.30
    },
    tv_viewing: {
      heavy: 0.35,        // 4+ hours daily
      moderate: 0.45,     // 1-4 hours daily  
      light: 0.20         // <1 hour daily
    },
    social_media_use: {
      heavy: 0.28,        // 3+ hours daily
      moderate: 0.52,     // 30min-3hrs daily
      minimal: 0.20       // <30min daily
    }
  },

  // Dietary & Consumption (USDA/CDC)
  consumption_habits: {
    diet_quality: {
      poor: 0.40,         // Standard American Diet
      mixed: 0.35,        // Some healthy choices
      good: 0.20,         // Consistently healthy
      restrictive: 0.05   // Eating disorders/extreme
    },
    meal_patterns: {
      regular_meals: 0.45,
      skip_breakfast: 0.30,
      irregular_eating: 0.25
    },
    food_security: {
      secure: 0.89,
      low_security: 0.07,
      very_low_security: 0.04
    }
  },

  // Sexual Health & Intimacy (Kinsey Institute/AARP)
  sexuality_wellness: {
    satisfaction_levels: {
      very_satisfied: 0.25,
      somewhat_satisfied: 0.45,
      dissatisfied: 0.20,
      major_dysfunction: 0.10
    },
    relationship_patterns: {
      monogamous: 0.70,
      serial_monogamy: 0.22,
      non_monogamous: 0.05,
      celibate: 0.03
    }
  },

  // Economic Stress (Federal Reserve/BLS)
  financial_reality: {
    debt_burden: {
      student_loans: { has_debt: 0.43, high_burden: 0.18 },
      credit_card: { carries_balance: 0.47, high_debt: 0.15 },
      medical_debt: 0.23
    },
    employment_stress: {
      underemployed: 0.07,
      multiple_jobs: 0.05,
      job_insecurity: 0.22,
      workplace_harassment: 0.15
    },
    housing_burden: {
      rent_burdened: 0.21,      // >30% income on housing
      lives_with_family: 0.18,  // adults 25-35
      housing_unstable: 0.08
    }
  },

  // Family & Caregiving (Census Bureau)
  family_dynamics: {
    caregiving_roles: {
      elderly_parents: 0.16,
      disabled_family: 0.08,
      single_parent: 0.12,       // of all adults
      blended_family: 0.15
    },
    relationship_status: {
      never_married: 0.33,       // adults 25+
      divorced: 0.11,
      separated: 0.02,
      widowed: 0.06
    }
  }
};

// Age-specific modifiers
export const AGE_MODIFIERS = {
  "18-25": {
    mental_health: { anxiety: 1.4, depression: 1.6, adhd: 1.5 },
    substance_use: { binge_drinking: 2.0, vaping: 3.0 },
    financial_stress: 1.3,
    screen_time: 1.4
  },
  "26-40": {
    work_stress: 1.2,
    caregiving_burden: 1.5,
    financial_pressure: 1.3
  },
  "41-65": {
    chronic_conditions: 1.8,
    work_dissatisfaction: 1.1,
    caregiving_burden: 2.0
  },
  "65+": {
    chronic_conditions: 2.5,
    medication_use: 2.8,
    social_isolation: 1.6
  }
};