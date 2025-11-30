import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regional expansion rules - map ambiguous terms to specific locations
const REGIONAL_EXPANSIONS: Record<string, { cities?: string[]; counties?: string[]; state?: string; country?: string }> = {
  // California regions
  'wine country': { counties: ['Napa', 'Sonoma'], state: 'California', country: 'United States' },
  'bay area': { cities: ['San Francisco', 'Oakland', 'San Jose', 'Fremont', 'Berkeley', 'Palo Alto'], state: 'California', country: 'United States' },
  'silicon valley': { cities: ['San Jose', 'Palo Alto', 'Mountain View', 'Sunnyvale', 'Santa Clara', 'Cupertino'], state: 'California', country: 'United States' },
  'socal': { cities: ['Los Angeles', 'San Diego', 'Irvine', 'Long Beach'], state: 'California', country: 'United States' },
  'southern california': { cities: ['Los Angeles', 'San Diego', 'Irvine', 'Long Beach', 'Anaheim'], state: 'California', country: 'United States' },
  'norcal': { cities: ['San Francisco', 'Oakland', 'Sacramento', 'San Jose'], state: 'California', country: 'United States' },
  'northern california': { cities: ['San Francisco', 'Oakland', 'Sacramento', 'San Jose'], state: 'California', country: 'United States' },
  'central valley': { cities: ['Fresno', 'Bakersfield', 'Stockton', 'Modesto'], state: 'California', country: 'United States' },
  'inland empire': { cities: ['Riverside', 'San Bernardino', 'Ontario', 'Fontana'], state: 'California', country: 'United States' },
  
  // Texas regions
  'dfw': { cities: ['Dallas', 'Fort Worth', 'Arlington', 'Plano', 'Irving'], state: 'Texas', country: 'United States' },
  'dallas-fort worth': { cities: ['Dallas', 'Fort Worth', 'Arlington', 'Plano'], state: 'Texas', country: 'United States' },
  'hill country': { cities: ['Austin', 'San Antonio', 'Fredericksburg', 'New Braunfels'], state: 'Texas', country: 'United States' },
  
  // Northeast
  'tristate': { cities: ['New York', 'Newark', 'Jersey City', 'Stamford'], state: 'New York', country: 'United States' },
  'tri-state': { cities: ['New York', 'Newark', 'Jersey City', 'Stamford'], state: 'New York', country: 'United States' },
  'new england': { cities: ['Boston', 'Providence', 'Hartford', 'Manchester', 'Portland'], country: 'United States' },
  'dmv': { cities: ['Washington', 'Arlington', 'Alexandria', 'Bethesda', 'Silver Spring'], country: 'United States' },
  
  // Southeast
  'research triangle': { cities: ['Raleigh', 'Durham', 'Chapel Hill'], state: 'North Carolina', country: 'United States' },
  
  // Midwest
  'twin cities': { cities: ['Minneapolis', 'Saint Paul', 'St. Paul'], state: 'Minnesota', country: 'United States' },
  'chicagoland': { cities: ['Chicago', 'Naperville', 'Aurora', 'Evanston'], state: 'Illinois', country: 'United States' },
  
  // West
  'pacific northwest': { cities: ['Seattle', 'Portland', 'Tacoma', 'Bellevue'], country: 'United States' },
  'pnw': { cities: ['Seattle', 'Portland', 'Tacoma', 'Bellevue'], country: 'United States' },
};

// Behavioral terms that map to collections
const BEHAVIORAL_COLLECTION_HINTS: Record<string, string[]> = {
  'party': ['Nightlife & Party-Goers', 'Heavy Drinkers'],
  'parties': ['Nightlife & Party-Goers', 'Heavy Drinkers'],
  'partying': ['Nightlife & Party-Goers', 'Heavy Drinkers'],
  'drinks': ['Heavy Drinkers', 'Wine Enthusiasts'],
  'drinking': ['Heavy Drinkers', 'Wine Enthusiasts'],
  'alcohol': ['Heavy Drinkers'],
  'wine': ['Wine Enthusiasts'],
  'fitness': ['Fitness Enthusiasts', 'Health Conscious'],
  'workout': ['Fitness Enthusiasts'],
  'gym': ['Fitness Enthusiasts'],
  'healthy': ['Health Conscious'],
  'organic': ['Health Conscious'],
  'vegan': ['Vegans & Vegetarians'],
  'vegetarian': ['Vegans & Vegetarians'],
  'tech': ['Tech Workers', 'Early Adopters'],
  'technology': ['Tech Workers', 'Early Adopters'],
  'startup': ['Entrepreneurs', 'Tech Workers'],
  'entrepreneur': ['Entrepreneurs', 'Small Business Owners'],
};

interface ParseRequest {
  query: string;
  available_collections?: Array<{ name: string; description?: string }>;
}

interface ParsedResult {
  success: boolean;
  recommendation: 'PROCEED' | 'PROCEED_WITH_WARNING' | 'CANNOT_INTERPRET';
  confidence: number;
  parsed: {
    count: number | null;
    age_min: number | null;
    age_max: number | null;
    gender: string[] | null;
    marital_status: string[] | null;
    has_children: boolean | null;
    location_country: string | null;
    location_state: string | null;
    location_cities: string[] | null;
    location_counties: string[] | null;
    occupation_keywords: string[];
    health_keywords: string[];
    interest_keywords: string[];
    suggested_collections: string[];
  };
  assumptions_made: string[];
  warnings: string[];
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { query, available_collections = [] }: ParseRequest = await req.json();

    if (!query || query.trim().length < 3) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Query is required and must be at least 3 characters',
          recommendation: 'CANNOT_INTERPRET',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`\n🧠 [ACP-PARSE-QUERY] Parsing: "${query}"`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AI service not configured',
          recommendation: 'CANNOT_INTERPRET',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build collection names for prompt
    const collectionNames = available_collections.map(c => c.name).join(', ') || 'None available';

    // Build regional expansion hints for prompt
    const regionHints = Object.keys(REGIONAL_EXPANSIONS).slice(0, 15).join(', ');

    const systemPrompt = `You are a query parser for a persona research platform. Your job is to extract structured search criteria from natural language queries.

CRITICAL RULES:
1. MAKE REASONABLE ASSUMPTIONS - Don't ask for clarification, just interpret intelligently
2. STEM KEYWORDS - Convert plurals to singular (owners → owner, nurses → nurse)
3. EXPAND REGIONAL TERMS - Use specific cities/counties for regional terms
4. SUGGEST COLLECTIONS - Match behavioral terms to relevant collections
5. BE CONFIDENT - Only use CANNOT_INTERPRET for truly unintelligible queries

REGIONAL EXPANSIONS (use these exact mappings):
${Object.entries(REGIONAL_EXPANSIONS).slice(0, 10).map(([term, exp]) => 
  `- "${term}" → cities: [${exp.cities?.slice(0, 3).join(', ') || 'N/A'}], state: ${exp.state || 'N/A'}`
).join('\n')}

AVAILABLE COLLECTIONS FOR SUGGESTIONS:
${collectionNames}

BEHAVIORAL TERM → COLLECTION MAPPINGS:
- party/partying → Nightlife & Party-Goers, Heavy Drinkers
- drinks/drinking → Heavy Drinkers, Wine Enthusiasts  
- fitness/gym → Fitness Enthusiasts
- tech/technology → Tech Workers

EXAMPLES:
Query: "3 personas from wine country in California"
→ Expand "wine country" to counties: ["Napa", "Sonoma"], state: "California"
→ Record assumption: "Interpreted 'wine country' as Napa/Sonoma counties"

Query: "small business owners in the US"
→ occupation_keywords: ["business", "owner"] (stemmed from "owners")
→ location_country: "United States"

Query: "people who like to party in NYC"
→ location_cities: ["New York"]
→ suggested_collections: ["Nightlife & Party-Goers", "Heavy Drinkers"]
→ Record assumption: "Interpreted 'like to party' as nightlife enthusiasts"`;

    const userPrompt = `Parse this persona search query: "${query}"

Extract all criteria and make intelligent assumptions for any ambiguous terms. Return structured data.`;

    const tools = [{
      type: 'function',
      function: {
        name: 'analyze_persona_query',
        description: 'Analyze and parse a persona search query into structured criteria',
        parameters: {
          type: 'object',
          properties: {
            recommendation: {
              type: 'string',
              enum: ['PROCEED', 'PROCEED_WITH_WARNING', 'CANNOT_INTERPRET'],
              description: 'PROCEED = clear query, PROCEED_WITH_WARNING = made assumptions, CANNOT_INTERPRET = truly unintelligible'
            },
            confidence: {
              type: 'number',
              description: 'Confidence in the parsing (0-1). Use 0.8+ for clear queries, 0.6-0.8 for queries with assumptions'
            },
            parsed: {
              type: 'object',
              properties: {
                count: { type: ['number', 'null'], description: 'Number of personas requested (null if not specified)' },
                age_min: { type: ['number', 'null'] },
                age_max: { type: ['number', 'null'] },
                gender: { 
                  type: ['array', 'null'], 
                  items: { type: 'string' },
                  description: 'Gender filter. Use ["female", "woman", "Female"] or ["male", "man", "Male"]'
                },
                marital_status: {
                  type: ['array', 'null'],
                  items: { type: 'string' },
                  description: 'Marital status filter'
                },
                has_children: { type: ['boolean', 'null'] },
                location_country: { type: ['string', 'null'], description: 'Full country name (e.g., "United States" not "US")' },
                location_state: { type: ['string', 'null'], description: 'Full state name (e.g., "California" not "CA")' },
                location_cities: { 
                  type: ['array', 'null'], 
                  items: { type: 'string' },
                  description: 'Specific cities to search. Expand regional terms to city lists.'
                },
                location_counties: {
                  type: ['array', 'null'],
                  items: { type: 'string' },
                  description: 'Specific counties to search (e.g., for wine country → Napa, Sonoma)'
                },
                occupation_keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Stemmed occupation keywords (owners → owner, managers → manager)'
                },
                health_keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Health-related keywords (diabetes, hypertension, etc.)'
                },
                interest_keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Interest/hobby keywords'
                },
                suggested_collections: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Collection names that match behavioral terms in the query'
                }
              },
              required: ['count', 'occupation_keywords', 'health_keywords', 'interest_keywords', 'suggested_collections']
            },
            assumptions_made: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of assumptions made during parsing (e.g., "Interpreted wine country as Napa/Sonoma")'
            },
            warnings: {
              type: 'array',
              items: { type: 'string' },
              description: 'Minor issues that do not prevent search but user should know about'
            }
          },
          required: ['recommendation', 'confidence', 'parsed', 'assumptions_made', 'warnings']
        }
      }
    }];

    console.log('   Calling Lovable AI (Gemini Flash)...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'analyze_persona_query' } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('   AI gateway error:', response.status, errorText);
      
      // Return fallback - don't fail the whole request
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI parsing failed, use deterministic fallback',
          recommendation: 'CANNOT_INTERPRET',
          fallback_reason: errorText,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await response.json();
    
    // Extract tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'analyze_persona_query') {
      console.error('   No valid tool call in response');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI did not return expected format',
          recommendation: 'CANNOT_INTERPRET',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsedArgs = JSON.parse(toolCall.function.arguments);
    
    const duration = Date.now() - startTime;
    console.log(`   ✅ Parsed in ${duration}ms`);
    console.log(`   Recommendation: ${parsedArgs.recommendation}`);
    console.log(`   Confidence: ${parsedArgs.confidence}`);
    console.log(`   Assumptions: ${parsedArgs.assumptions_made?.join(', ') || 'none'}`);

    const result: ParsedResult = {
      success: parsedArgs.recommendation !== 'CANNOT_INTERPRET',
      recommendation: parsedArgs.recommendation,
      confidence: parsedArgs.confidence,
      parsed: {
        count: parsedArgs.parsed.count,
        age_min: parsedArgs.parsed.age_min,
        age_max: parsedArgs.parsed.age_max,
        gender: parsedArgs.parsed.gender,
        marital_status: parsedArgs.parsed.marital_status,
        has_children: parsedArgs.parsed.has_children,
        location_country: parsedArgs.parsed.location_country,
        location_state: parsedArgs.parsed.location_state,
        location_cities: parsedArgs.parsed.location_cities,
        location_counties: parsedArgs.parsed.location_counties,
        occupation_keywords: parsedArgs.parsed.occupation_keywords || [],
        health_keywords: parsedArgs.parsed.health_keywords || [],
        interest_keywords: parsedArgs.parsed.interest_keywords || [],
        suggested_collections: parsedArgs.parsed.suggested_collections || [],
      },
      assumptions_made: parsedArgs.assumptions_made || [],
      warnings: parsedArgs.warnings || [],
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [ACP-PARSE-QUERY] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        recommendation: 'CANNOT_INTERPRET',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
