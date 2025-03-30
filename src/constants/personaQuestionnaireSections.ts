
export interface SectionDefinition {
  id: string;
  label: string;
}

export const sections: SectionDefinition[] = [
  { id: "identification", label: "Identification" },
  { id: "dailyLife", label: "Daily Life" },
  { id: "decisionMaking", label: "Decision Making" },
  { id: "spending", label: "Spending" },
  { id: "information", label: "Information" },
  { id: "values", label: "Values" },
  { id: "deeperInsight", label: "Deeper Insight" },
  { id: "background", label: "Background" },
  { id: "worldview", label: "Worldview" },
  { id: "final", label: "Final" },
];
