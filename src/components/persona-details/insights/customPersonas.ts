
export interface PersonaInsights {
  decisions: string[];
  drivers: string[];
  persuasion: string[];
}

export const customPersonas: Record<string, PersonaInsights> = {
  // First persona: 5e22fdc2
  "5e22fdc2": {
    decisions: [
      "Approaches decisions with careful research and data analysis",
      "Prefers structured evaluation frameworks to reduce uncertainty"
    ],
    drivers: [
      "Motivated by professional recognition and intellectual growth",
      "Values stability and predictable outcomes over high-risk ventures"
    ],
    persuasion: [
      "Responds best to logical arguments backed by credible evidence",
      "Values detailed explanations over emotional appeals"
    ]
  },
  // Second persona: c69eb1eb
  "c69eb1eb": {
    decisions: [
      "Makes quick, intuitive decisions based on past experiences",
      "Comfortable taking calculated risks when potential rewards are clear"
    ],
    drivers: [
      "Motivated primarily by creative freedom and autonomy",
      "Seeks opportunities for self-expression and innovation"
    ],
    persuasion: [
      "Persuaded by stories and real-world examples rather than statistics",
      "Appreciates authentic communication with emotional resonance"
    ]
  },
  // Third persona: 4f7b9e3c
  "4f7b9e3c": {
    decisions: [
      "Balances intuition with collaborative input from trusted peers",
      "Considers social and ethical implications before taking action"
    ],
    drivers: [
      "Motivated by creating positive social impact through their work",
      "Values community connection and shared accomplishments"
    ],
    persuasion: [
      "Responds to inclusive language and community-focused messaging",
      "Prefers solutions that benefit multiple stakeholders"
    ]
  },
  // Ray Wv2 persona: ee23e252
  "ee23e252": {
    decisions: [
      "Makes decisions based on practical experience and proven methods",
      "Considers long-term consequences before committing to major changes"
    ],
    drivers: [
      "Motivated by achieving measurable results and tangible outcomes",
      "Values consistency and reliability in both work and relationships"
    ],
    persuasion: [
      "Responds to straightforward communication with clear benefits",
      "Prefers evidence-based arguments over theoretical concepts"
    ]
  },
  // The existing Alina R profile
  "9f8540fa": {
    decisions: [
      "Relies on data visualization tools for complex financial decisions",
      "Balances risk and reward through multi-scenario modeling"
    ],
    drivers: [
      "Motivated by sustainable growth and ethical investing principles",
      "Values work-life integration and financial security"
    ],
    persuasion: [
      "Responds to evidence-based arguments with practical applications",
      "Appreciates detailed analysis backed by real-world examples"
    ]
  }
};
