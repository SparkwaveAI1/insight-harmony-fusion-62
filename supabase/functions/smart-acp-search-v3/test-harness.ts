#!/usr/bin/env -S deno run --allow-net --allow-env
/**
 * Test Harness for smart-acp-search-v3
 * 
 * Run with:
 *   deno run --allow-net --allow-env test-harness.ts
 * 
 * Or to test against deployed function:
 *   SUPABASE_URL=https://wgerdrdsuusnrdnwwelt.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   deno run --allow-net --allow-env test-harness.ts
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://wgerdrdsuusnrdnwwelt.supabase.co';
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjE4OTEyMCwiZXhwIjoyMDU3NzY1MTIwfQ.sgFdv1QSlPGesPZGJ_sYOagLxn7jDNjELmArJOQlkSU';

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/smart-acp-search-v3`;

interface TestCase {
  name: string;
  query: string;
  persona_count: number;
  expected_min_matches: number;
  validation?: (result: any) => boolean;
  description?: string;
}

// The 16 comprehensive test queries from the plan
const TEST_CASES: TestCase[] = [
  {
    name: "adults_no_degree",
    query: "adults without college degrees ages 30-50",
    persona_count: 5,
    expected_min_matches: 5,
    description: "Should find adults 30-50 with high school education"
  },
  {
    name: "college_women_tech",
    query: "college-educated women in tech",
    persona_count: 5,
    expected_min_matches: 3,
    validation: (r) => r.personas?.every((p: any) => 
      p.demographics?.gender?.toLowerCase().includes('female') &&
      (p.demographics?.occupation?.toLowerCase().includes('tech') || 
       p.demographics?.occupation?.toLowerCase().includes('software') ||
       p.demographics?.occupation?.toLowerCase().includes('engineer'))
    ),
    description: "Should find females with college degree in tech occupations"
  },
  {
    name: "hs_grads_blue_collar",
    query: "high school graduates working blue-collar jobs",
    persona_count: 5,
    expected_min_matches: 3,
    description: "Should find HS grads in manual/trade occupations"
  },
  {
    name: "parents_low_income",
    query: "parents with no degree, household income under $50k",
    persona_count: 5,
    expected_min_matches: 3,
    validation: (r) => r.personas?.every((p: any) => 
      p.demographics?.has_children === true || 
      p.full_profile?.toLowerCase().includes('child')
    ),
    description: "Should find parents without degree, low income"
  },
  {
    name: "advanced_degrees",
    query: "professionals with advanced degrees (masters or PhD)",
    persona_count: 5,
    expected_min_matches: 3,
    validation: (r) => r.personas?.every((p: any) => 
      p.demographics?.education_level?.toLowerCase().includes('master') ||
      p.demographics?.education_level?.toLowerCase().includes('doctor') ||
      p.demographics?.education_level?.toLowerCase().includes('phd')
    ),
    description: "Should find people with graduate degrees"
  },
  {
    name: "hispanic_women_diabetes",
    query: "Hispanic women over 40 with diabetes",
    persona_count: 5,
    expected_min_matches: 2,
    validation: (r) => r.personas?.every((p: any) => 
      p.demographics?.gender?.toLowerCase().includes('female') &&
      p.demographics?.age >= 40
    ),
    description: "Should find Hispanic women 40+ with diabetes"
  },
  {
    name: "rural_black_men_heart",
    query: "rural Black men ages 50-70 with heart conditions",
    persona_count: 5,
    expected_min_matches: 1,
    description: "Narrow criteria - may have limited matches"
  },
  {
    name: "low_income_asian_families",
    query: "low-income Asian families with children under 5",
    persona_count: 5,
    expected_min_matches: 1,
    description: "Narrow criteria - may have limited matches"
  },
  {
    name: "divorced_women_fulltime",
    query: "divorced women ages 35-55 working full-time",
    persona_count: 5,
    expected_min_matches: 2,
    validation: (r) => r.personas?.every((p: any) => 
      p.demographics?.gender?.toLowerCase().includes('female') &&
      p.demographics?.age >= 35 &&
      p.demographics?.age <= 55
    ),
    description: "Should find divorced women 35-55 employed"
  },
  {
    name: "veterans_ptsd",
    query: "veterans with PTSD ages 30-60",
    persona_count: 5,
    expected_min_matches: 1,
    description: "Specialized criteria - may have limited matches"
  },
  {
    name: "obese_smokers",
    query: "obese adults who smoke, ages 40-60",
    persona_count: 5,
    expected_min_matches: 2,
    description: "Health-focused query"
  },
  {
    name: "suburban_parents_retirement",
    query: "middle-income suburban parents planning retirement",
    persona_count: 5,
    expected_min_matches: 3,
    description: "Should find middle-class parents nearing retirement"
  },
  {
    name: "young_adults_debt_anxiety",
    query: "young adults 18-25 with student debt and anxiety",
    persona_count: 5,
    expected_min_matches: 2,
    validation: (r) => r.personas?.every((p: any) => 
      p.demographics?.age >= 18 &&
      p.demographics?.age <= 25
    ),
    description: "Should find young adults with financial/mental health concerns"
  },
  {
    name: "seniors_mobility",
    query: "seniors over 70 living alone with mobility issues",
    persona_count: 5,
    expected_min_matches: 1,
    validation: (r) => r.personas?.every((p: any) => 
      p.demographics?.age >= 70
    ),
    description: "Should find elderly with mobility concerns"
  },
  {
    name: "entrepreneurs_stress",
    query: "self-employed entrepreneurs with chronic stress",
    persona_count: 5,
    expected_min_matches: 2,
    description: "Should find business owners with stress"
  },
  {
    name: "crypto_investors",
    query: "crypto investors",
    persona_count: 5,
    expected_min_matches: 5,
    description: "THE CRITICAL TEST - must find crypto-related personas"
  },
];

interface TestResult {
  name: string;
  query: string;
  passed: boolean;
  duration_ms: number;
  match_count: number;
  expected_min: number;
  personas_found: number;
  validation_passed: boolean | null;
  error?: string;
  parsed_criteria?: any;
}

async function runTest(testCase: TestCase, precheckOnly: boolean = false): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        research_query: testCase.query,
        persona_count: testCase.persona_count,
        precheck_only: precheckOnly,
      }),
    });

    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        name: testCase.name,
        query: testCase.query,
        passed: false,
        duration_ms: duration,
        match_count: 0,
        expected_min: testCase.expected_min_matches,
        personas_found: 0,
        validation_passed: null,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const result = await response.json();
    
    if (result.status === 'error') {
      return {
        name: testCase.name,
        query: testCase.query,
        passed: false,
        duration_ms: duration,
        match_count: 0,
        expected_min: testCase.expected_min_matches,
        personas_found: 0,
        validation_passed: null,
        error: result.error,
        parsed_criteria: result.parsed_criteria,
      };
    }

    const matchCount = precheckOnly ? result.match_count : result.total_matching;
    const personasFound = precheckOnly ? 0 : (result.personas?.length || 0);
    
    // Run validation function if provided and not precheck
    let validationPassed: boolean | null = null;
    if (!precheckOnly && testCase.validation && result.personas?.length > 0) {
      try {
        validationPassed = testCase.validation(result);
      } catch (e) {
        validationPassed = false;
      }
    }

    const passed = matchCount >= testCase.expected_min_matches && 
                   (validationPassed === null || validationPassed);

    return {
      name: testCase.name,
      query: testCase.query,
      passed,
      duration_ms: duration,
      match_count: matchCount,
      expected_min: testCase.expected_min_matches,
      personas_found: personasFound,
      validation_passed: validationPassed,
      parsed_criteria: result.parsed_criteria,
    };

  } catch (error: any) {
    return {
      name: testCase.name,
      query: testCase.query,
      passed: false,
      duration_ms: Date.now() - startTime,
      match_count: 0,
      expected_min: testCase.expected_min_matches,
      personas_found: 0,
      validation_passed: null,
      error: error.message,
    };
  }
}

async function runAllTests(precheckOnly: boolean = true): Promise<void> {
  console.log('='.repeat(80));
  console.log(`ACP Search V3 Test Suite - ${precheckOnly ? 'PRECHECK MODE' : 'FULL SEARCH MODE'}`);
  console.log(`Target: ${FUNCTION_URL}`);
  console.log('='.repeat(80));
  console.log('');

  const results: TestResult[] = [];
  
  for (const testCase of TEST_CASES) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`  Query: "${testCase.query}"`);
    
    const result = await runTest(testCase, precheckOnly);
    results.push(result);
    
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} - ${result.match_count} matches (need ${result.expected_min}) in ${result.duration_ms}ms`);
    
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    if (!precheckOnly && result.validation_passed === false) {
      console.log(`  Validation: FAILED`);
    }
    if (result.parsed_criteria) {
      console.log(`  Parsed: ${JSON.stringify(result.parsed_criteria)}`);
    }
    console.log('');
    
    // Small delay between tests to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  // Summary
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration_ms, 0) / results.length;
  
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed} (${(passed/results.length*100).toFixed(1)}%)`);
  console.log(`Failed: ${failed}`);
  console.log(`Avg Duration: ${avgDuration.toFixed(0)}ms`);
  console.log('');
  
  if (failed > 0) {
    console.log('FAILED TESTS:');
    for (const result of results.filter(r => !r.passed)) {
      console.log(`  - ${result.name}: ${result.error || `only ${result.match_count}/${result.expected_min} matches`}`);
    }
  }
  
  // Critical test status
  const cryptoTest = results.find(r => r.name === 'crypto_investors');
  console.log('');
  console.log('='.repeat(80));
  console.log(`CRITICAL TEST (crypto_investors): ${cryptoTest?.passed ? '✅ PASS' : '❌ FAIL'}`);
  if (cryptoTest) {
    console.log(`  Matches: ${cryptoTest.match_count}, Duration: ${cryptoTest.duration_ms}ms`);
  }
  console.log('='.repeat(80));
}

// Run specific test by name
async function runSingleTest(name: string, precheckOnly: boolean = false): Promise<void> {
  const testCase = TEST_CASES.find(t => t.name === name);
  if (!testCase) {
    console.error(`Test case not found: ${name}`);
    console.log('Available tests:', TEST_CASES.map(t => t.name).join(', '));
    return;
  }
  
  console.log(`Running single test: ${name}`);
  const result = await runTest(testCase, precheckOnly);
  console.log(JSON.stringify(result, null, 2));
}

// CLI interface
const args = Deno.args;
if (args.includes('--help')) {
  console.log(`
ACP Search V3 Test Harness

Usage:
  deno run --allow-net --allow-env test-harness.ts [options]

Options:
  --precheck     Run in precheck mode only (faster, just counts)
  --full         Run full search mode (slower, validates personas)
  --test <name>  Run single test by name
  --help         Show this help

Examples:
  # Run all tests in precheck mode (default)
  deno run --allow-net --allow-env test-harness.ts

  # Run all tests with full search
  deno run --allow-net --allow-env test-harness.ts --full

  # Run single test
  deno run --allow-net --allow-env test-harness.ts --test crypto_investors

Available tests:
${TEST_CASES.map(t => `  - ${t.name}: ${t.description || t.query}`).join('\n')}
`);
} else if (args.includes('--test')) {
  const testIndex = args.indexOf('--test');
  const testName = args[testIndex + 1];
  const precheck = !args.includes('--full');
  await runSingleTest(testName, precheck);
} else {
  const precheck = !args.includes('--full');
  await runAllTests(precheck);
}
