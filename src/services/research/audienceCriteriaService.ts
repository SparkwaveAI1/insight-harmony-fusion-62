
import { supabase } from "@/integrations/supabase/client";

export interface SearchCriteria {
  keywords: string[];
  demographics: {
    age_ranges?: string[];
    occupations?: string[];
    income_levels?: string[];
    locations?: string[];
    interests?: string[];
  };
  behavioral_traits?: string[];
  use_cases?: string[];
}

export async function generateSearchCriteria(targetDescription: string): Promise<SearchCriteria> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-audience-criteria', {
      body: { targetDescription }
    });

    if (error) {
      console.error('Error generating search criteria:', error);
      throw error;
    }

    return data.criteria;
  } catch (error) {
    console.error('Failed to generate search criteria:', error);
    // Return fallback criteria based on basic text analysis
    return generateFallbackCriteria(targetDescription);
  }
}

function generateFallbackCriteria(description: string): SearchCriteria {
  const lowercaseDesc = description.toLowerCase();
  
  // Extract basic keywords
  const keywords = description
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 10);

  // Basic demographic detection
  const demographics: SearchCriteria['demographics'] = {};
  
  // Age detection
  if (lowercaseDesc.includes('young') || lowercaseDesc.includes('millennial')) {
    demographics.age_ranges = ['18-24', '25-34'];
  } else if (lowercaseDesc.includes('middle-aged') || lowercaseDesc.includes('gen x')) {
    demographics.age_ranges = ['35-44', '45-54'];
  } else if (lowercaseDesc.includes('senior') || lowercaseDesc.includes('boomer')) {
    demographics.age_ranges = ['55-64', '65+'];
  }

  // Occupation detection
  if (lowercaseDesc.includes('professional') || lowercaseDesc.includes('white collar')) {
    demographics.occupations = ['Manager', 'Engineer', 'Consultant', 'Analyst'];
  } else if (lowercaseDesc.includes('student')) {
    demographics.occupations = ['Student'];
  } else if (lowercaseDesc.includes('entrepreneur') || lowercaseDesc.includes('business owner')) {
    demographics.occupations = ['Entrepreneur', 'Business Owner'];
  }

  // Technology interests
  const use_cases = [];
  if (lowercaseDesc.includes('mobile') || lowercaseDesc.includes('app')) {
    use_cases.push('mobile apps', 'technology');
  }
  if (lowercaseDesc.includes('shopping') || lowercaseDesc.includes('e-commerce')) {
    use_cases.push('online shopping', 'retail');
  }
  if (lowercaseDesc.includes('banking') || lowercaseDesc.includes('finance')) {
    use_cases.push('financial services', 'banking');
  }

  return {
    keywords,
    demographics,
    use_cases: use_cases.length > 0 ? use_cases : undefined
  };
}
