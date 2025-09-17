// DEPLOYMENT TEST PAGE - Completely independent from existing persona infrastructure
// This page tests if NEW CODE can reach production by bypassing all legacy services

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// DEPLOYMENT VERIFICATION CONSTANTS
const TEST_PAGE_ID = `TEST_PERSONA_LIBRARY_${Date.now()}`;
const DEPLOYMENT_SIGNATURE = `FRESH_DEPLOYMENT_TEST_${Math.random().toString(36)}`;

console.log(`🚨 TEST PAGE LOADED: ${TEST_PAGE_ID}`);
console.log(`🔥 DEPLOYMENT SIGNATURE: ${DEPLOYMENT_SIGNATURE}`);
console.log(`💀 If you see these logs on PRODUCTION, deployment is working!`);

interface V4Persona {
  id: string;
  persona_id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  created_at: string;
  profile_image_url?: string;
}

export default function TestPersonaLibrary() {
  const [personas, setPersonas] = useState<V4Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    console.log(`🧪 TEST PAGE COMPONENT MOUNTED: ${TEST_PAGE_ID}`);
    
    const runDeploymentTest = async () => {
      const results: string[] = [];
      
      try {
        results.push('✅ Component successfully mounted');
        results.push(`✅ Deployment signature: ${DEPLOYMENT_SIGNATURE}`);
        
        console.log('🚀 Testing direct V4 personas access...');
        results.push('🚀 Attempting direct v4_personas query...');
        
        // Direct query to v4_personas table - completely bypassing existing services
        const { data, error: queryError } = await supabase
          .from('v4_personas')
          .select('persona_id, name, user_id, is_public, created_at, profile_image_url')
          .eq('is_public', true)
          .limit(10);
        
        if (queryError) {
          console.error('❌ V4 Personas query failed:', queryError);
          results.push(`❌ Query failed: ${queryError.message}`);
          setError(`Query failed: ${queryError.message}`);
        } else {
          console.log('✅ V4 Personas query successful:', data?.length || 0, 'personas found');
          results.push(`✅ Query successful: ${data?.length || 0} public personas found`);
          setPersonas(data?.map(p => ({
            ...p,
            id: p.persona_id // Use persona_id as id for V4Persona compatibility
          })) || []);
        }
        
        // Test private personas for current user
        console.log('🔐 Testing user-specific personas...');
        const { data: userPersonas, error: userError } = await supabase
          .from('v4_personas')
          .select('persona_id, name, user_id, is_public, created_at, updated_at, schema_version, full_profile, conversation_summary, creation_stage, creation_completed, profile_image_url')
          .limit(5);
        
        if (userError) {
          results.push(`🔐 User personas test: ${userError.message}`);
        } else {
          results.push(`🔐 User personas accessible: ${userPersonas?.length || 0} total personas`);
        }
        
      } catch (err) {
        console.error('💥 Test failed with exception:', err);
        results.push(`💥 Exception: ${err}`);
        setError(`Exception: ${err}`);
      } finally {
        setTestResults(results);
        setLoading(false);
      }
    };

    runDeploymentTest();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 p-6 border-2 border-primary rounded-lg bg-primary/5">
          <h1 className="text-3xl font-bold text-primary mb-4">
            🧪 Deployment Test Page
          </h1>
          <p className="text-muted-foreground mb-4">
            <strong>Purpose:</strong> Test if fresh code can reach production by bypassing existing persona infrastructure
          </p>
          <div className="bg-background p-4 rounded border">
            <p className="font-mono text-sm">
              <strong>Test ID:</strong> {TEST_PAGE_ID}
            </p>
            <p className="font-mono text-sm">
              <strong>Signature:</strong> {DEPLOYMENT_SIGNATURE}
            </p>
          </div>
        </div>

        {/* Test Results Section */}
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🔬 Test Results</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="font-mono text-sm p-2 bg-muted rounded">
                {result}
              </div>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-lg">🔄 Running deployment tests...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 border border-destructive rounded-lg bg-destructive/5">
            <h3 className="text-lg font-semibold text-destructive mb-2">❌ Test Failed</h3>
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Success State - Personas Display */}
        {!loading && !error && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                ✅ Test Successful - V4 Personas Accessible
              </h2>
              <div className="text-muted-foreground">
                Found {personas.length} public personas
              </div>
            </div>

            {personas.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/5">
                <p className="text-lg text-muted-foreground">
                  🎯 Database connection successful, but no public personas found.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This confirms that fresh code can reach production and query the v4_personas table.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personas.map((persona) => (
                  <div key={persona.persona_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      {persona.profile_image_url ? (
                        <img 
                          src={persona.profile_image_url} 
                          alt={persona.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {persona.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{persona.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {persona.persona_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(persona.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 border rounded-lg bg-muted/5">
          <h3 className="text-lg font-semibold mb-3">📋 Test Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check browser console for deployment verification logs</li>
            <li>If you see the test logs above, deployment is working</li>
            <li>If personas load, v4_personas table is accessible</li>
            <li>This bypasses all existing persona services to test fresh code</li>
          </ol>
        </div>
      </div>
    </div>
  );
}