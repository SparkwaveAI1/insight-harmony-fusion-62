import { supabase } from '@/integrations/supabase/client';

export async function getConversionStatus() {
  try {
    // Get overall status
    const { data: statusData, error: statusError } = await supabase
      .from('v4_personas')
      .select('statistical_enhancement_status')
      .eq('statistical_enhancement_status', 'pending');

    if (statusError) {
      console.error('Error fetching status:', statusError);
      return null;
    }

    const pendingCount = statusData.length;

    // Get sample of incomplete personas
    const { data: sampleData, error: sampleError } = await supabase
      .from('v4_personas')
      .select('persona_id, name, full_profile')
      .eq('statistical_enhancement_status', 'pending')
      .limit(3);

    if (sampleError) {
      console.error('Error fetching samples:', sampleError);
      return null;
    }

    const samples = sampleData.map(persona => {
      const profile = persona.full_profile as any;
      return {
        personaId: persona.persona_id,
        name: persona.name,
        hasHealthProfile: !!(profile?.health_profile),
        hasMoneyProfile: !!(profile?.money_profile),
        hasAdoptionProfile: !!(profile?.adoption_profile)
      };
    });

    return {
      pendingCount,
      samples,
      ready: true
    };
  } catch (error) {
    console.error('Error getting conversion status:', error);
    return null;
  }
}

export async function testConversionFunction() {
  console.log('🚀 Testing conversion function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('convert-personas-statistical', {
      body: {
        batchSize: 3,
        startIndex: 0,
        dryRun: true
      }
    });

    if (error) {
      console.error('❌ Function call failed:', error);
      return null;
    }

    console.log('✅ Function test successful!');
    console.log('Results:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Function test error:', error);
    return null;
  }
}