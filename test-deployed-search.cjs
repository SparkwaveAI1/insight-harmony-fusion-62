/**
 * Test the deployed enhanced ACP search function
 */

const https = require('https');

const SUPABASE_URL = 'https://wgerdrdsuusnrdnwwelt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjE4OTEyMCwiZXhwIjoyMDU3NzY1MTIwfQ.sgFdv1QSlPGesPZGJ_sYOagLxn7jDNjELmArJOQlkSU';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
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

async function testSearch(query, expectedCount) {
  console.log(`\n🧪 Testing: "${query}"`);
  console.log(`Expected: ${expectedCount} personas`);
  
  try {
    // Test using the search RPC function directly
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/search_personas_unified`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: {
        p_limit: expectedCount,
        p_public_only: true
      }
    });

    if (response.ok && response.data) {
      console.log(`✅ Search successful: Found ${response.data.length || 0} personas`);
      
      if (response.data.length > 0) {
        const sample = response.data[0];
        console.log(`📄 Sample: ${sample.name} - ${sample.age}y ${sample.gender} ${sample.occupation} (${sample.political_lean || 'unknown politics'})`);
        
        // Check if political_lean field exists
        const politicsCount = response.data.filter(p => p.political_lean).length;
        console.log(`🗳️  Political data available for ${politicsCount}/${response.data.length} personas`);
      }
    } else {
      console.log(`❌ Search failed: ${response.status}`, response.data);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testDiversitySearch() {
  console.log('\n🎯 Testing diversity search...');
  
  try {
    // Test with different political leans filter
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/search_personas_unified`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: {
        p_limit: 10,
        p_public_only: true,
        p_political_leans: ['conservative', 'liberal', 'moderate']
      }
    });

    if (response.ok && response.data) {
      console.log(`✅ Political diversity search: Found ${response.data.length || 0} personas`);
      
      if (response.data.length > 0) {
        const politicalBreakdown = {};
        response.data.forEach(p => {
          const lean = p.political_lean || 'unknown';
          politicalBreakdown[lean] = (politicalBreakdown[lean] || 0) + 1;
        });
        
        console.log(`📊 Political breakdown:`, politicalBreakdown);
      }
    } else {
      console.log(`❌ Diversity search failed: ${response.status}`, response.data);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing Deployed Enhanced ACP Search');
  console.log('=======================================');

  // Test basic functionality
  await testSearch('5 people', 5);
  await testDiversitySearch();
  
  console.log('\n✅ Tests completed');
}

runTests().catch(console.error);