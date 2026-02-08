/**
 * Comprehensive ACP Search Test Suite
 * Tests enhanced search with diversity constraints
 */

import { searchPersonasEnhanced, parseQueryWithGPT } from '../supabase/functions/_shared/acpSearchEnhanced';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = 'https://wgerdrdsuusnrdnwwelt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjE4OTEyMCwiZXhwIjoyMDU3NzY1MTIwfQ.sgFdv1QSlPGesPZGJ_sYOagLxn7jDNjELmArJOQlkSU';
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface TestCase {
  name: string;
  query: string;
  expectedCount: number;
  validationRules: ValidationRule[];
  timeout?: number; // ms
}

interface ValidationRule {
  type: 'count' | 'unique' | 'filter' | 'diversity' | 'no_duplicates';
  field?: string;
  value?: any;
  min?: number;
  max?: number;
  message?: string;
}

// Test cases covering all query types
const testCases: TestCase[] = [
  // BASIC FILTERING (5 tests)
  {
    name: 'Basic crypto investors',
    query: '5 crypto investors',
    expectedCount: 5,
    validationRules: [
      { type: 'count', min: 5 },
      { type: 'filter', field: 'occupation', value: /crypto|bitcoin|blockchain/i, message: 'Should include crypto-related occupation terms' }
    ]
  },
  {
    name: 'Women over 40 from Texas',
    query: 'women over 40 from Texas',
    expectedCount: 3,
    validationRules: [
      { type: 'count', min: 3 },
      { type: 'filter', field: 'gender', value: 'female' },
      { type: 'filter', field: 'age', min: 40 },
      { type: 'filter', field: 'state_region', value: 'Texas' }
    ]
  },
  {
    name: 'Software engineers in California',
    query: '4 software engineers in California',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'filter', field: 'occupation', value: /software|engineer|developer/i },
      { type: 'filter', field: 'state_region', value: 'California' }
    ]
  },
  {
    name: 'College graduates who are parents',
    query: '3 college graduates who are parents',
    expectedCount: 3,
    validationRules: [
      { type: 'count', min: 3 },
      { type: 'filter', field: 'education_level', value: /bachelor|master|college/i },
      { type: 'filter', field: 'has_children', value: true }
    ]
  },
  {
    name: 'Seniors with health conditions',
    query: '3 seniors with health conditions',
    expectedCount: 3,
    validationRules: [
      { type: 'count', min: 3 },
      { type: 'filter', field: 'age', min: 65 }
    ]
  },

  // DIVERSITY REQUIREMENTS (8 tests)
  {
    name: 'Different political orientations',
    query: '3 people with different political orientations',
    expectedCount: 3,
    validationRules: [
      { type: 'count', min: 3 },
      { type: 'unique', field: 'political_lean', min: 3, message: 'Should have 3 unique political orientations' },
      { type: 'no_duplicates' }
    ]
  },
  {
    name: 'Mix of ages and income levels',
    query: '5 people with mix of ages and income levels',
    expectedCount: 5,
    validationRules: [
      { type: 'count', min: 5 },
      { type: 'diversity', field: 'age', min: 2, message: 'Should have diverse ages' },
      { type: 'diversity', field: 'income_bracket', min: 2, message: 'Should have diverse income levels' }
    ]
  },
  {
    name: 'People from different states',
    query: '4 people from different states',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'unique', field: 'state_region', min: 4, message: 'Should have 4 different states' }
    ]
  },
  {
    name: 'Variety of occupations',
    query: '5 people with variety of occupations and backgrounds',
    expectedCount: 5,
    validationRules: [
      { type: 'count', min: 5 },
      { type: 'diversity', field: 'occupation', min: 3, message: 'Should have diverse occupations' },
      { type: 'diversity', field: 'ethnicity', min: 2, message: 'Should have diverse backgrounds' }
    ]
  },
  {
    name: 'Different ethnicities and education',
    query: '4 people with different ethnicities and education levels',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'unique', field: 'ethnicity', min: 3, message: 'Should have at least 3 different ethnicities' },
      { type: 'diversity', field: 'education_level', min: 2, message: 'Should have diverse education levels' }
    ]
  },
  {
    name: 'One from each age decade',
    query: '4 people: one from their 20s, 30s, 40s, and 50s',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'unique', field: 'age_decade', min: 4, message: 'Should have one person from each decade' }
    ]
  },
  {
    name: 'Balanced men and women',
    query: '4 people with balanced representation of men and women',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'diversity', field: 'gender', min: 2, message: 'Should have both genders represented' }
    ]
  },
  {
    name: 'Different political leans from the South',
    query: '3 people with different political leans but all from the South',
    expectedCount: 3,
    validationRules: [
      { type: 'count', min: 3 },
      { type: 'unique', field: 'political_lean', min: 3, message: 'Should have 3 different political leans' },
      { type: 'filter', field: 'state_region', value: /(Texas|Florida|Georgia|Alabama|Mississippi|Louisiana|Arkansas|Tennessee|Kentucky|South Carolina|North Carolina|Virginia|West Virginia)/i }
    ]
  },

  // COMPLEX COMBINATIONS (7 tests)
  {
    name: 'Conservatives and liberals in crypto',
    query: '4 people: 2 conservatives and 2 liberals who invest in crypto',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'filter', field: 'occupation', value: /crypto|bitcoin|blockchain|invest/i },
      { type: 'diversity', field: 'political_lean', min: 2, message: 'Should have both conservatives and liberals' }
    ]
  },
  {
    name: 'Tech workers with different politics from different states',
    query: '5 tech workers with different political orientations from different states',
    expectedCount: 5,
    validationRules: [
      { type: 'count', min: 5 },
      { type: 'filter', field: 'occupation', value: /tech|software|engineer|developer/i },
      { type: 'unique', field: 'political_lean', min: 3, message: 'Should have diverse political orientations' },
      { type: 'unique', field: 'state_region', min: 3, message: 'Should be from different states' }
    ]
  },
  {
    name: 'Women entrepreneurs from diverse backgrounds',
    query: '4 women entrepreneurs from diverse ethnic backgrounds',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'filter', field: 'gender', value: 'female' },
      { type: 'filter', field: 'occupation', value: /entrepreneur|business|founder|owner/i },
      { type: 'diversity', field: 'ethnicity', min: 3, message: 'Should have diverse ethnic backgrounds' }
    ]
  },
  {
    name: 'People over 50 with different incomes from West Coast',
    query: '3 people over 50 with different income brackets from the West Coast',
    expectedCount: 3,
    validationRules: [
      { type: 'count', min: 3 },
      { type: 'filter', field: 'age', min: 50 },
      { type: 'unique', field: 'income_bracket', min: 3, message: 'Should have 3 different income brackets' },
      { type: 'filter', field: 'state_region', value: /(California|Oregon|Washington|Nevada)/i }
    ]
  },
  {
    name: 'College-educated parents with varying politics',
    query: '4 college-educated parents with varying political views',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'filter', field: 'education_level', value: /bachelor|master|college/i },
      { type: 'filter', field: 'has_children', value: true },
      { type: 'diversity', field: 'political_lean', min: 2, message: 'Should have varying political views' }
    ]
  },
  {
    name: 'Healthcare workers from different regions with different ages',
    query: '4 healthcare workers from different regions with different ages',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'filter', field: 'occupation', value: /health|medical|nurse|doctor|physician/i },
      { type: 'diversity', field: 'state_region', min: 3, message: 'Should be from different regions' },
      { type: 'diversity', field: 'age', min: 3, message: 'Should have different ages' }
    ]
  },
  {
    name: 'Urban vs rural with different politics',
    query: '4 people: mix of urban and rural, different political leans',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'diversity', field: 'political_lean', min: 2, message: 'Should have different political leans' }
      // Note: We'd need urban/rural data to test location diversity
    ]
  },

  // NICHE/SPECIALIZED (5 tests)
  {
    name: 'Environmentally conscious swing state voters',
    query: '3 environmentally conscious voters from swing states',
    expectedCount: 3,
    validationRules: [
      { type: 'count', min: 3 },
      { type: 'filter', field: 'state_region', value: /(Florida|Pennsylvania|Michigan|Wisconsin|Arizona|Georgia|Nevada|North Carolina)/i }
    ]
  },
  {
    name: 'Small business owners with children different incomes',
    query: '3 small business owners with children under different income brackets',
    expectedCount: 3,
    validationRules: [
      { type: 'count', min: 3 },
      { type: 'filter', field: 'occupation', value: /business|owner|entrepreneur/i },
      { type: 'filter', field: 'has_children', value: true },
      { type: 'unique', field: 'income_bracket', min: 3, message: 'Should have 3 different income brackets' }
    ]
  },
  {
    name: 'Retired professionals with different politics',
    query: '3 retired professionals with different political orientations',
    expectedCount: 3,
    validationRules: [
      { type: 'count', min: 3 },
      { type: 'filter', field: 'occupation', value: /retired|former/i },
      { type: 'unique', field: 'political_lean', min: 3, message: 'Should have 3 different political orientations' }
    ]
  },
  {
    name: 'Young adults different ethnicities tech-savvy',
    query: '4 young adults (20-30) from different ethnic backgrounds who are tech-savvy',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'filter', field: 'age', min: 20, max: 30 },
      { type: 'diversity', field: 'ethnicity', min: 3, message: 'Should have different ethnic backgrounds' }
    ]
  },
  {
    name: 'Middle-class Midwest families varying education',
    query: '4 middle-class families from the Midwest with varying education levels',
    expectedCount: 4,
    validationRules: [
      { type: 'count', min: 4 },
      { type: 'filter', field: 'income_bracket', value: /50,000|75,000|middle/i },
      { type: 'filter', field: 'state_region', value: /(Illinois|Indiana|Iowa|Michigan|Minnesota|Ohio|Wisconsin|Missouri)/i },
      { type: 'diversity', field: 'education_level', min: 2, message: 'Should have varying education levels' }
    ]
  }
];

// Validation functions
function validateResults(personas: any[], rules: ValidationRule[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const rule of rules) {
    switch (rule.type) {
      case 'count':
        if (rule.min && personas.length < rule.min) {
          errors.push(`Expected at least ${rule.min} personas, got ${personas.length}`);
        }
        if (rule.max && personas.length > rule.max) {
          errors.push(`Expected at most ${rule.max} personas, got ${personas.length}`);
        }
        break;

      case 'unique':
        if (rule.field) {
          const values = personas.map(p => getPersonaFieldValue(p, rule.field!));
          const uniqueValues = new Set(values);
          if (rule.min && uniqueValues.size < rule.min) {
            errors.push(rule.message || `Expected at least ${rule.min} unique ${rule.field} values, got ${uniqueValues.size}`);
          }
        }
        break;

      case 'diversity':
        if (rule.field) {
          const values = personas.map(p => getPersonaFieldValue(p, rule.field!));
          const uniqueValues = new Set(values);
          if (rule.min && uniqueValues.size < rule.min) {
            errors.push(rule.message || `Expected diversity in ${rule.field} (at least ${rule.min} different values), got ${uniqueValues.size}`);
          }
        }
        break;

      case 'filter':
        if (rule.field) {
          const failingPersonas = personas.filter(p => {
            const value = getPersonaFieldValue(p, rule.field!);
            if (rule.value instanceof RegExp) {
              return !rule.value.test(String(value));
            } else if (typeof rule.value === 'boolean') {
              return value !== rule.value;
            } else if (rule.min !== undefined) {
              return value < rule.min;
            } else if (rule.max !== undefined) {
              return value > rule.max;
            } else {
              return value !== rule.value;
            }
          });
          
          if (failingPersonas.length > 0) {
            errors.push(rule.message || `Filter validation failed for ${rule.field}: ${failingPersonas.length} personas don't match criteria`);
          }
        }
        break;

      case 'no_duplicates':
        const ids = personas.map(p => p.persona_id);
        if (new Set(ids).size !== ids.length) {
          errors.push('Found duplicate personas in results');
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors };
}

function getPersonaFieldValue(persona: any, field: string): any {
  switch (field) {
    case 'age':
      return persona.demographics?.age || 0;
    case 'age_decade':
      const age = persona.demographics?.age || 0;
      return `${Math.floor(age / 10) * 10}s`;
    case 'gender':
      return persona.demographics?.gender;
    case 'occupation':
      return persona.demographics?.occupation || '';
    case 'state_region':
      return persona.demographics?.location?.split(',')[1]?.trim() || '';
    case 'ethnicity':
      return persona.demographics?.ethnicity;
    case 'education_level':
      return persona.demographics?.education_level;
    case 'income_bracket':
      return persona.demographics?.income_bracket;
    case 'political_lean':
      return persona.demographics?.political_lean;
    case 'has_children':
      return persona.demographics?.has_children;
    default:
      return persona.demographics?.[field];
  }
}

// Test runner
async function runTest(testCase: TestCase): Promise<{ passed: boolean; error?: string; duration: number }> {
  console.log(`\n🧪 Running test: ${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);
  
  const startTime = Date.now();
  
  try {
    const result = await searchPersonasEnhanced(
      supabase,
      OPENAI_KEY!,
      testCase.query,
      testCase.expectedCount
    );
    
    const duration = Date.now() - startTime;
    
    if (!result.success) {
      return { 
        passed: false, 
        error: `Search failed: ${result.error || 'Unknown error'}`,
        duration 
      };
    }
    
    console.log(`✅ Search completed in ${result.duration_ms}ms`);
    console.log(`📊 Found ${result.personas.length} personas (expected ${testCase.expectedCount})`);
    
    // Validate results
    const validation = validateResults(result.personas, testCase.validationRules);
    
    if (!validation.valid) {
      console.log(`❌ Validation failed:`);
      validation.errors.forEach(error => console.log(`   - ${error}`));
      return { 
        passed: false, 
        error: `Validation failed: ${validation.errors.join('; ')}`,
        duration 
      };
    }
    
    console.log(`✅ All validations passed`);
    
    // Print sample results
    console.log(`📋 Sample results:`);
    result.personas.slice(0, 2).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.demographics?.age}y ${p.demographics?.gender} ${p.demographics?.occupation} (${p.demographics?.political_lean})`);
    });
    
    return { passed: true, duration };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return { 
      passed: false, 
      error: error.message,
      duration 
    };
  }
}

// Main test suite
async function runAllTests() {
  console.log('🚀 Starting Comprehensive ACP Search Test Suite');
  console.log(`📊 Running ${testCases.length} test cases\n`);
  
  if (!OPENAI_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }
  
  let passed = 0;
  let failed = 0;
  let totalDuration = 0;
  const results: Array<{ name: string; passed: boolean; error?: string; duration: number }> = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({ name: testCase.name, ...result });
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
      console.log(`❌ FAILED: ${result.error}`);
    }
    
    totalDuration += result.duration;
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passed}/${testCases.length}`);
  console.log(`❌ Failed: ${failed}/${testCases.length}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms (avg: ${Math.round(totalDuration / testCases.length)}ms per test)`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n🎯 SUCCESS RATE:', `${Math.round((passed / testCases.length) * 100)}%`);
  
  if (passed === testCases.length) {
    console.log('\n🎉 All tests passed! ACP search is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the implementation.');
    process.exit(1);
  }
}

// Export for external use
export { runAllTests, runTest, testCases, validateResults };

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}