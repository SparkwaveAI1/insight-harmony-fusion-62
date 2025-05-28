
export const getTraitValue = (traitProfile: any, path: string): number => {
  const parts = path.split('.');
  let value = traitProfile;
  
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined || value === null) break;
  }
  
  if (typeof value === 'number') return Math.max(0, Math.min(1, value));
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return Math.max(0, Math.min(1, parsed));
    
    // Handle descriptive values
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('very high') || lowerValue.includes('high')) return 0.8;
    if (lowerValue.includes('moderate') || lowerValue.includes('medium')) return 0.5;
    if (lowerValue.includes('low') || lowerValue.includes('very low')) return 0.2;
  }
  
  return 0.5; // Default fallback
};
