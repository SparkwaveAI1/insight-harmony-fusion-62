// Test file to run the persona conversion dry run
// This will be called manually to test the conversion function

import { supabase } from '@/integrations/supabase/client';

export interface ConversionResult {
  processed: number;
  success: number;
  failed: number;
  examples: Array<{
    personaId: string;
    traitsAdded: string[];
    beforeAfter: {
      chronicConditions: { before: string[], after: string[] };
      medications: { before: string[], after: string[] };
      financialStressors: { before: string[], after: string[] };
    }
  }>;
}

export async function runConversionTest(): Promise<ConversionResult | null> {
  try {
    console.log('🧪 Starting persona conversion test (dry run)...');
    
    const { data, error } = await supabase.functions.invoke('convert-personas-statistical', {
      body: {
        batchSize: 3,
        startIndex: 0,
        dryRun: true
      }
    });

    if (error) {
      console.error('❌ Error calling conversion function:', error);
      return null;
    }

    console.log('✅ Conversion test completed:', data);
    
    // Format results for display
    if (data?.examples) {
      console.log('\n📊 Sample Conversion Results:');
      data.examples.forEach((example: any, index: number) => {
        console.log(`\n${index + 1}. Persona: ${example.personaId}`);
        console.log(`   Traits Added: ${example.traitsAdded.join(', ')}`);
        console.log(`   Chronic Conditions: ${example.beforeAfter.chronicConditions.before.join(', ')} → ${example.beforeAfter.chronicConditions.after.join(', ')}`);
        console.log(`   Medications: ${example.beforeAfter.medications.before.join(', ')} → ${example.beforeAfter.medications.after.join(', ')}`);
        console.log(`   Financial Stressors: ${example.beforeAfter.financialStressors.before.join(', ')} → ${example.beforeAfter.financialStressors.after.join(', ')}`);
      });
    }

    return data;
  } catch (error) {
    console.error('❌ Test conversion error:', error);
    return null;
  }
}

// Uncomment to run the test:
// runConversionTest().then(result => {
//   if (result) {
//     console.log(`\n🎯 Test Summary: ${result.processed} processed, ${result.success} successful, ${result.failed} failed`);
//   }
// });