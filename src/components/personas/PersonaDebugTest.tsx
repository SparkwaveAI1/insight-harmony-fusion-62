import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PersonaDebugTest = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebugTest = async () => {
      console.log('🔍 PERSONA DEBUG TEST STARTING');
      const timestamp = new Date().toISOString();
      const info: any = {
        timestamp,
        environment: process.env.NODE_ENV || 'unknown',
        url: window.location.href,
        userAgent: navigator.userAgent,
        supabaseUrl: 'https://wgerdrdsuusnrdnwwelt.supabase.co'
      };

      try {
        // Test 1: Direct Supabase connection
        console.log('🔍 Test 1: Testing Supabase connection');
        const { data: connectionTest, error: connectionError } = await supabase
          .from('v4_personas')
          .select('count')
          .limit(1);
        
        info.connectionTest = {
          success: !connectionError,
          error: connectionError?.message || null,
          data: connectionTest
        };
        console.log('🔍 Connection test result:', info.connectionTest);

        // Test 2: Count all personas
        console.log('🔍 Test 2: Counting all personas');
        const { count, error: countError } = await supabase
          .from('v4_personas')
          .select('*', { count: 'exact', head: true });
        
        info.totalCount = {
          success: !countError,
          error: countError?.message || null,
          count: count
        };
        console.log('🔍 Total count result:', info.totalCount);

        // Test 3: Count public personas
        console.log('🔍 Test 3: Counting public personas');
        const { count: publicCount, error: publicCountError } = await supabase
          .from('v4_personas')
          .select('*', { count: 'exact', head: true })
          .eq('is_public', true);
        
        info.publicCount = {
          success: !publicCountError,
          error: publicCountError?.message || null,
          count: publicCount
        };
        console.log('🔍 Public count result:', info.publicCount);

        // Test 4: Fetch first 3 public personas
        console.log('🔍 Test 4: Fetching first 3 public personas');
        const { data: samplePersonas, error: sampleError } = await supabase
          .from('v4_personas')
          .select('persona_id, name, is_public, created_at')
          .eq('is_public', true)
          .limit(3);
        
        info.samplePersonas = {
          success: !sampleError,
          error: sampleError?.message || null,
          data: samplePersonas
        };
        console.log('🔍 Sample personas result:', info.samplePersonas);

        // Test 5: Test getAllPersonas function
        console.log('🔍 Test 5: Testing getAllPersonas function');
        try {
          const { getAllPersonas } = await import('@/services/persona/operations/getPersonas');
          const allPersonas = await getAllPersonas();
          const publicPersonas = allPersonas.filter(p => p.is_public);
          
          info.getAllPersonasTest = {
            success: true,
            totalFetched: allPersonas.length,
            publicFiltered: publicPersonas.length,
            firstPersona: allPersonas[0] ? {
              id: allPersonas[0].persona_id,
              name: allPersonas[0].name,
              isPublic: allPersonas[0].is_public
            } : null
          };
        } catch (getAllError: any) {
          info.getAllPersonasTest = {
            success: false,
            error: getAllError.message
          };
        }
        console.log('🔍 getAllPersonas test result:', info.getAllPersonasTest);

      } catch (error: any) {
        console.error('🔍 Debug test failed:', error);
        info.generalError = error.message;
      }

      setDebugInfo(info);
      setLoading(false);
      
      console.log('🔍 PERSONA DEBUG TEST COMPLETE:', info);
    };

    runDebugTest();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-bold text-yellow-800">🔍 Running Persona Debug Test...</h3>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-bold text-blue-800 mb-4">🔍 Persona Debug Results</h3>
      <div className="space-y-3 text-sm">
        <div>
          <strong>Environment:</strong> {debugInfo.environment} | {debugInfo.timestamp}
        </div>
        <div>
          <strong>URL:</strong> {debugInfo.url}
        </div>
        
        <div className="border-t pt-3">
          <strong>Connection Test:</strong> 
          <span className={debugInfo.connectionTest?.success ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.connectionTest?.success ? ' ✅ Success' : ' ❌ Failed'}
          </span>
          {debugInfo.connectionTest?.error && (
            <div className="text-red-600 text-xs">{debugInfo.connectionTest.error}</div>
          )}
        </div>

        <div>
          <strong>Total Personas Count:</strong> 
          {debugInfo.totalCount?.success ? (
            <span className="text-green-600"> {debugInfo.totalCount.count}</span>
          ) : (
            <span className="text-red-600"> Error: {debugInfo.totalCount?.error}</span>
          )}
        </div>

        <div>
          <strong>Public Personas Count:</strong> 
          {debugInfo.publicCount?.success ? (
            <span className="text-green-600"> {debugInfo.publicCount.count}</span>
          ) : (
            <span className="text-red-600"> Error: {debugInfo.publicCount?.error}</span>
          )}
        </div>

        <div>
          <strong>Sample Personas:</strong> 
          {debugInfo.samplePersonas?.success ? (
            <div className="text-green-600">
              ✅ {debugInfo.samplePersonas.data?.length || 0} fetched
              {debugInfo.samplePersonas.data?.map((p: any) => (
                <div key={p.persona_id} className="text-xs">
                  • {p.name} ({p.persona_id})
                </div>
              ))}
            </div>
          ) : (
            <span className="text-red-600"> Error: {debugInfo.samplePersonas?.error}</span>
          )}
        </div>

        <div>
          <strong>getAllPersonas Function:</strong> 
          {debugInfo.getAllPersonasTest?.success ? (
            <div className="text-green-600">
              ✅ Total: {debugInfo.getAllPersonasTest.totalFetched}, 
              Public: {debugInfo.getAllPersonasTest.publicFiltered}
            </div>
          ) : (
            <span className="text-red-600"> Error: {debugInfo.getAllPersonasTest?.error}</span>
          )}
        </div>

        {debugInfo.generalError && (
          <div className="text-red-600 border-t pt-3">
            <strong>General Error:</strong> {debugInfo.generalError}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaDebugTest;