// Test script for Stage 2: Edge Enforcement Wrapper
// Run with: node scripts/test-reserve-execute.js

const SUPABASE_URL = "https://wgerdrdsuusnrdnwwelt.supabase.co";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/reserve_and_execute`;

// Helper function to call the edge function
async function callReserveExecute(userId, actionType, actionPayload = {}, idempotencyKey = null) {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      actionType,
      actionPayload,
      idempotencyKey: idempotencyKey || `test-${Date.now()}-${Math.random()}`
    })
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

// Test 1: Happy Path
async function testHappyPath() {
  console.log("🧪 Test 1: Happy Path");
  
  const result = await callReserveExecute(
    "550e8400-e29b-41d4-a716-446655440001", // test user ID
    "image_gen",
    { foo: "bar" },
    "happy-path-test-1"
  );
  
  console.log("Result:", result);
  
  if (result.data.ok && result.data.result && result.data.usageId) {
    console.log("✅ Happy path test PASSED");
  } else {
    console.log("❌ Happy path test FAILED");
  }
  console.log();
}

// Test 2: Failure Path
async function testFailurePath() {
  console.log("🧪 Test 2: Failure Path");
  
  const result = await callReserveExecute(
    "550e8400-e29b-41d4-a716-446655440001",
    "image_gen", 
    { forceFail: true },
    "failure-test-1"
  );
  
  console.log("Result:", result);
  
  if (!result.data.ok && result.data.error === "Simulated action failure") {
    console.log("✅ Failure path test PASSED");
  } else {
    console.log("❌ Failure path test FAILED");
  }
  console.log();
}

// Test 3: Idempotency
async function testIdempotency() {
  console.log("🧪 Test 3: Idempotency");
  
  const idempotencyKey = "idempotency-test-1";
  
  // First call
  const result1 = await callReserveExecute(
    "550e8400-e29b-41d4-a716-446655440001",
    "image_gen",
    { test: "idempotency" },
    idempotencyKey
  );
  
  console.log("First call result:", result1);
  
  // Second call with same idempotency key
  const result2 = await callReserveExecute(
    "550e8400-e29b-41d4-a716-446655440001",
    "image_gen",
    { test: "idempotency" },
    idempotencyKey
  );
  
  console.log("Second call result:", result2);
  
  if (result1.data.ok && result2.data.ok && 
      result1.data.usageId === result2.data.usageId) {
    console.log("✅ Idempotency test PASSED");
  } else {
    console.log("❌ Idempotency test FAILED");
  }
  console.log();
}

// Test 4: Concurrency Stress Test
async function testConcurrency() {
  console.log("🧪 Test 4: Concurrency Stress Test");
  console.log("Note: This test requires a user with exactly 100 credits seeded in the database");
  
  const userId = "550e8400-e29b-41d4-a716-446655440002"; // different test user
  const promises = [];
  
  // Fire 5 parallel requests each requiring 30 credits (total 150, but user has 100)
  // Only 3 should succeed
  for (let i = 0; i < 5; i++) {
    promises.push(
      callReserveExecute(
        userId,
        "expensive_action",
        { batch: i, cost: 30 },
        `concurrency-${i}-${Date.now()}`
      )
    );
  }
  
  const results = await Promise.allSettled(promises);
  
  let successes = 0;
  let failures = 0;
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`Request ${index}:`, result.value.data);
      if (result.value.data.ok) {
        successes++;
      } else {
        failures++;
      }
    } else {
      console.log(`Request ${index} rejected:`, result.reason);
      failures++;
    }
  });
  
  console.log(`Successes: ${successes}, Failures: ${failures}`);
  
  if (successes <= 3 && failures >= 2) {
    console.log("✅ Concurrency test PASSED (some requests properly failed due to insufficient credits)");
  } else {
    console.log("❌ Concurrency test FAILED");
  }
  console.log();
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting Stage 2 QA Tests\n");
  
  try {
    await testHappyPath();
    await testFailurePath();
    await testIdempotency();
    await testConcurrency();
    
    console.log("✨ All tests completed!");
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

module.exports = { runTests, callReserveExecute };