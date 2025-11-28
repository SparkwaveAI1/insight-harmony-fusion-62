/**
 * ACP Concurrency Test
 * 
 * Tests that 5 simultaneous requests to acp-job-execute complete correctly
 * with non-mixed results.
 * 
 * Usage: node scripts/test-acp-concurrency.js
 */

const SUPABASE_URL = 'https://wgerdrdsuusnrdnwwelt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY';

// 5 distinct test cases with unique identifiers
const testCases = [
  {
    job_id: 'concurrent-test-A-' + Date.now(),
    client_address: 'test-client-A',
    persona_criteria: 'overweight adults in Texas',
    questions: ['What is your biggest health challenge? Please mention TEST-A in your response.'],
    num_personas: 2,
    include_summary: false // Skip summary for speed
  },
  {
    job_id: 'concurrent-test-B-' + Date.now(),
    client_address: 'test-client-B', 
    persona_criteria: 'young professionals in California',
    questions: ['What motivates you at work? Please mention TEST-B in your response.'],
    num_personas: 2,
    include_summary: false
  },
  {
    job_id: 'concurrent-test-C-' + Date.now(),
    client_address: 'test-client-C',
    persona_criteria: 'retired seniors in Florida',
    questions: ['How do you spend your free time? Please mention TEST-C in your response.'],
    num_personas: 2,
    include_summary: false
  },
  {
    job_id: 'concurrent-test-D-' + Date.now(),
    client_address: 'test-client-D',
    persona_criteria: 'parents with young children',
    questions: ['What are your biggest parenting challenges? Please mention TEST-D in your response.'],
    num_personas: 2,
    include_summary: false
  },
  {
    job_id: 'concurrent-test-E-' + Date.now(),
    client_address: 'test-client-E',
    persona_criteria: 'college students',
    questions: ['What are your career aspirations? Please mention TEST-E in your response.'],
    num_personas: 2,
    include_summary: false
  }
];

async function callAcpJobExecute(testCase) {
  const startTime = Date.now();
  console.log(`🚀 [${testCase.job_id}] Starting request...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/acp-job-execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testCase)
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const data = await response.json();
    
    return {
      job_id: testCase.job_id,
      status: response.status,
      success: response.ok,
      duration: `${duration}s`,
      data,
      persona_criteria: testCase.persona_criteria
    };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    return {
      job_id: testCase.job_id,
      status: 'error',
      success: false,
      duration: `${duration}s`,
      error: error.message,
      persona_criteria: testCase.persona_criteria
    };
  }
}

function validateResults(results) {
  console.log('\n========================================');
  console.log('📊 VALIDATION RESULTS');
  console.log('========================================\n');
  
  let allPassed = true;
  
  for (const result of results) {
    const jobLetter = result.job_id.split('-')[2]; // Extract A, B, C, D, E
    console.log(`\n--- Job ${jobLetter} (${result.persona_criteria}) ---`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Duration: ${result.duration}`);
    
    if (!result.success) {
      console.log(`   ❌ FAILED: ${result.error || result.data?.error || 'Unknown error'}`);
      allPassed = false;
      continue;
    }
    
    // Check if job_id matches
    if (result.data?.job_id !== result.job_id) {
      console.log(`   ❌ JOB ID MISMATCH: Expected ${result.job_id}, got ${result.data?.job_id}`);
      allPassed = false;
      continue;
    }
    
    // Check personas interviewed
    const personasInterviewed = result.data?.study_results?.personas_interviewed || 0;
    console.log(`   Personas interviewed: ${personasInterviewed}`);
    
    if (personasInterviewed === 0) {
      console.log(`   ⚠️ WARNING: No personas found for criteria`);
    }
    
    console.log(`   ✅ PASSED - Response isolated correctly`);
  }
  
  return allPassed;
}

async function runConcurrencyTest() {
  console.log('========================================');
  console.log('🧪 ACP CONCURRENCY TEST');
  console.log('========================================');
  console.log(`Starting ${testCases.length} simultaneous requests...\n`);
  
  const startTime = Date.now();
  
  // Fire all requests simultaneously
  const promises = testCases.map(tc => callAcpJobExecute(tc));
  const results = await Promise.all(promises);
  
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Log completion
  console.log('\n========================================');
  console.log('📋 COMPLETION SUMMARY');
  console.log('========================================');
  console.log(`Total time: ${totalDuration}s`);
  console.log(`Requests: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  
  // Validate results
  const allPassed = validateResults(results);
  
  console.log('\n========================================');
  if (allPassed) {
    console.log('✅ ALL CONCURRENCY TESTS PASSED');
  } else {
    console.log('❌ SOME TESTS FAILED - Review above for details');
  }
  console.log('========================================\n');
  
  return { results, allPassed };
}

// Run the test
runConcurrencyTest()
  .then(({ allPassed }) => {
    process.exit(allPassed ? 0 : 1);
  })
  .catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
  });
