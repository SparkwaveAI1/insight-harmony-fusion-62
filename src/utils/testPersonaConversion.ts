import { supabase } from '@/integrations/supabase/client';

export async function testPersonaConversion() {
  try {
    console.log('Testing persona conversion (dry run)...');
    
    const { data, error } = await supabase.functions.invoke('convert-personas-statistical', {
      body: {
        batchSize: 3,
        startIndex: 0,
        dryRun: true
      }
    });

    if (error) {
      console.error('Error calling conversion function:', error);
      return null;
    }

    console.log('Conversion test results:', data);
    return data;
  } catch (error) {
    console.error('Test conversion error:', error);
    return null;
  }
}

// Call this function to test the conversion
// testPersonaConversion();