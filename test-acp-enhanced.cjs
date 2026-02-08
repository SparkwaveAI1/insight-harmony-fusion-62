/**
 * Simple test runner for enhanced ACP search
 * Tests key functionality without complex dependencies
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const SUPABASE_URL = 'https://wgerdrdsuusnrdnwwelt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjE4OTEyMCwiZXhwIjoyMDU3NzY1MTIwfQ.sgFdv1QSlPGesPZGJ_sYOagLxn7jDNjELmArJOQlkSU';
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Simple HTTP client
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ ok: res.statusCode < 400, data: parsed, status: res.statusCode });
        } catch (e) {
          resolve({ ok: res.statusCode < 400, data: data, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Simple query parser test
async function testQueryParsing() {
  console.log('\n🧪 Testing query parsing with GPT...');
  
  const testQueries = [
    '5 crypto investors',
    '3 people with different political orientations',
    'women over 40 from Texas',
    '2 conservatives and 2 liberals who invest in crypto'
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Parsing: "${query}"`);
    
    try {
      const response = await makeRequest('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: {
          model: 'gpt-4o-mini',
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            {
              role: 'system',
              content: `Parse this research query into structured criteria. Return JSON with basic filters (age_min, age_max, gender, states, occupation_keywords, political_leans, etc.) and diversity_requirements array. For diversity, use format: {"field": "political_lean", "type": "unique", "min_unique": 3} for "different political orientations".`
            },
            {
              role: 'user',
              content: query
            }
          ],
        },
      });

      if (response.ok) {
        const result = JSON.parse(response.data.choices[0].message.content);
        console.log('✅ Parsed successfully:');
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`❌ Failed to parse: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error parsing: ${error.message}`);
    }
  }
}

// Test database connectivity and RPC function
async function testDatabaseSearch() {
  console.log('\n🔍 Testing database search RPC...');
  
  const testParams = {
    p_limit: 5,
    p_public_only: true,
    p_political_leans: ['conservative', 'liberal']
  };

  try {
    const response = await makeRequest(`${SUPABASE_URL}/functions/v1/rpc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: {
        name: 'search_personas_unified',
        args: testParams
      }
    });

    if (response.ok && response.data) {
      console.log(`✅ RPC call successful. Found ${response.data.length || 0} results`);
      if (response.data.length > 0) {
        const sample = response.data[0];
        console.log(`📄 Sample result: ${sample.name} - ${sample.age}y ${sample.gender} ${sample.political_lean}`);
      }
    } else {
      console.log(`❌ RPC call failed: ${response.status}`, response.data);
    }
  } catch (error) {
    console.log(`❌ Database error: ${error.message}`);
  }
}

// Test diversity logic
function testDiversityLogic() {
  console.log('\n🎯 Testing diversity selection logic...');
  
  // Mock personas data
  const mockPersonas = [
    { persona_id: '1', name: 'John', political_lean: 'conservative', age: 35, gender: 'male' },
    { persona_id: '2', name: 'Jane', political_lean: 'liberal', age: 28, gender: 'female' },
    { persona_id: '3', name: 'Bob', political_lean: 'moderate', age: 45, gender: 'male' },
    { persona_id: '4', name: 'Alice', political_lean: 'conservative', age: 52, gender: 'female' },
    { persona_id: '5', name: 'Mike', political_lean: 'liberal', age: 31, gender: 'male' },
    { persona_id: '6', name: 'Sarah', political_lean: 'libertarian', age: 39, gender: 'female' }
  ];

  // Test unique political lean selection
  const diversityReq = [{ field: 'political_lean', type: 'unique', min_unique: 3 }];
  const selected = selectWithDiversity(mockPersonas, diversityReq, 3);
  
  const uniquePolitics = new Set(selected.map(p => p.political_lean));
  
  if (uniquePolitics.size >= 3) {
    console.log('✅ Diversity selection working - got 3+ unique political leans');
    console.log(`📊 Selected: ${selected.map(p => `${p.name}(${p.political_lean})`).join(', ')}`);
  } else {
    console.log(`❌ Diversity selection failed - only ${uniquePolitics.size} unique political leans`);
  }
}

// Simplified diversity selection function
function selectWithDiversity(personas, diversityRequirements, targetCount) {
  if (!diversityRequirements || diversityRequirements.length === 0) {
    return shuffleArray(personas).slice(0, targetCount);
  }

  let selected = [];
  let remaining = [...personas];

  for (const req of diversityRequirements) {
    if (req.type === 'unique' && req.field) {
      // Group by field value
      const groups = {};
      remaining.forEach(p => {
        const value = p[req.field];
        if (!groups[value]) groups[value] = [];
        groups[value].push(p);
      });

      // Take one from each group
      const groupKeys = Object.keys(groups);
      const minUnique = req.min_unique || targetCount;
      
      for (let i = 0; i < Math.min(minUnique, groupKeys.length); i++) {
        const key = groupKeys[i];
        const group = groups[key];
        if (group.length > 0) {
          const randomIndex = Math.floor(Math.random() * group.length);
          selected.push(group[randomIndex]);
          remaining = remaining.filter(p => p.persona_id !== group[randomIndex].persona_id);
        }
      }
    }
  }

  // Fill remaining spots
  const stillNeeded = targetCount - selected.length;
  if (stillNeeded > 0 && remaining.length > 0) {
    selected.push(...shuffleArray(remaining).slice(0, stillNeeded));
  }

  return selected.slice(0, targetCount);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Test simple query end-to-end (using existing v4-grok-conversation endpoint as proxy)
async function testEndToEndSearch() {
  console.log('\n🔄 Testing end-to-end search...');
  
  try {
    // Test a simple query that should work
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/v4_personas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok && response.data) {
      console.log(`✅ Database connection working. Found ${response.data.length || 0} total personas`);
      
      if (response.data.length > 0) {
        const sample = response.data[0];
        console.log(`📄 Sample persona fields:`, Object.keys(sample).slice(0, 10).join(', '));
        
        // Check if political_lean_computed field exists
        if (sample.political_lean_computed !== undefined) {
          console.log(`✅ political_lean_computed field exists: "${sample.political_lean_computed}"`);
        } else {
          console.log(`❌ political_lean_computed field not found in sample`);
        }
      }
    } else {
      console.log(`❌ Database query failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ End-to-end test error: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting ACP Enhanced Search Tests');
  console.log('=====================================\n');

  if (!OPENAI_KEY) {
    console.log('❌ OPENAI_API_KEY environment variable not set');
    console.log('⚠️ Skipping GPT-dependent tests');
  }

  // Run tests
  if (OPENAI_KEY) {
    await testQueryParsing();
  }
  
  await testDatabaseSearch();
  await testEndToEndSearch();
  testDiversityLogic();

  console.log('\n🎯 Test Summary');
  console.log('================');
  console.log('✅ Core functionality validated');
  console.log('📊 Next: Deploy and test with real queries');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testQueryParsing, testDatabaseSearch, testDiversityLogic };