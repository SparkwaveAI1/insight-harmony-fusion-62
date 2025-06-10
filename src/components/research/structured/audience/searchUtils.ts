
import { Persona } from '@/services/persona/types';

// Helper function to create searchable text from persona data
export const createSearchableText = (persona: Persona): string => {
  const searchTerms: string[] = [];
  
  // Basic info
  searchTerms.push(persona.name);
  if (persona.prompt) searchTerms.push(persona.prompt);
  
  // Demographics from metadata
  if (persona.metadata) {
    const meta = persona.metadata;
    
    // Age-related terms
    if (meta.age) {
      const age = typeof meta.age === 'string' ? parseInt(meta.age) : meta.age;
      searchTerms.push(`age ${age}`);
      searchTerms.push(`${age} years old`);
      
      // Age ranges
      if (age >= 18 && age <= 25) searchTerms.push('gen z', 'young adult', '18-25');
      if (age >= 26 && age <= 35) searchTerms.push('millennial', 'young professional', '26-35');
      if (age >= 36 && age <= 45) searchTerms.push('middle aged', 'established professional', '36-45');
      if (age >= 46 && age <= 55) searchTerms.push('mature professional', '46-55');
      if (age >= 56) searchTerms.push('senior', 'older adult', '56+', 'baby boomer');
    }
    
    // Occupation and employment
    if (meta.occupation) {
      searchTerms.push(meta.occupation);
      
      // Add employment type synonyms
      const occupation = meta.occupation.toLowerCase();
      if (occupation.includes('manager') || occupation.includes('director') || occupation.includes('executive')) {
        searchTerms.push('management', 'leadership', 'executive');
      }
      if (occupation.includes('engineer') || occupation.includes('developer') || occupation.includes('programmer')) {
        searchTerms.push('tech', 'technology', 'IT', 'software', 'technical');
      }
      if (occupation.includes('teacher') || occupation.includes('professor') || occupation.includes('educator')) {
        searchTerms.push('education', 'academic', 'teaching');
      }
      if (occupation.includes('doctor') || occupation.includes('nurse') || occupation.includes('medical')) {
        searchTerms.push('healthcare', 'medical', 'health');
      }
      if (occupation.includes('sales') || occupation.includes('marketing')) {
        searchTerms.push('business', 'commercial', 'sales');
      }
    }
    
    // Location and geography
    if (meta.location) searchTerms.push(meta.location);
    if (meta.region) searchTerms.push(meta.region);
    
    // Income and education
    if (meta.income_level) {
      searchTerms.push(meta.income_level);
      const income = meta.income_level.toLowerCase();
      if (income.includes('high') || income.includes('wealthy') || income.includes('affluent')) {
        searchTerms.push('high income', 'wealthy', 'affluent', 'upper class');
      }
      if (income.includes('middle') || income.includes('moderate')) {
        searchTerms.push('middle class', 'moderate income');
      }
      if (income.includes('low') || income.includes('budget')) {
        searchTerms.push('low income', 'budget conscious', 'price sensitive');
      }
    }
    
    if (meta.education) {
      searchTerms.push(meta.education);
      const education = meta.education.toLowerCase();
      if (education.includes('college') || education.includes('university') || education.includes('bachelor')) {
        searchTerms.push('college educated', 'university graduate', 'degree holder');
      }
      if (education.includes('master') || education.includes('mba') || education.includes('graduate')) {
        searchTerms.push('advanced degree', 'graduate education', 'postgraduate');
      }
      if (education.includes('phd') || education.includes('doctorate')) {
        searchTerms.push('doctoral', 'academic', 'researcher');
      }
    }
    
    // Gender
    if (meta.gender) searchTerms.push(meta.gender);
    
    // Add any other metadata fields
    Object.entries(meta).forEach(([key, value]) => {
      if (value && typeof value === 'string' && !['age', 'occupation', 'location', 'region', 'income_level', 'education', 'gender'].includes(key)) {
        searchTerms.push(value);
      }
    });
  }
  
  return searchTerms.join(' ').toLowerCase();
};

// Enhanced search function
export const searchPersonas = (personas: Persona[], searchTerm: string): Persona[] => {
  if (!searchTerm.trim()) {
    return personas;
  }
  
  const searchLower = searchTerm.toLowerCase().trim();
  return personas.filter(persona => {
    const searchableText = createSearchableText(persona);
    return searchableText.includes(searchLower);
  });
};
