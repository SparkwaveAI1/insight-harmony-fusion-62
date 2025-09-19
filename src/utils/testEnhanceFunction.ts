import { supabase } from '@/integrations/supabase/client';

export async function testEnhanceFunction(personaId: string) {
  console.log('Testing enhance function with persona:', personaId);

  const { data, error } = await supabase.functions.invoke('enhance-persona-statistics', {
    body: { personaId }
  });

  if (error) {
    console.error('Error calling function:', error);
    return { error: error.message };
  }

  return data;
}

// Test with a pending persona
export async function runEnhanceTest() {
  const result = await testEnhanceFunction('v4_1755845109762_q3u9zlnew');
  console.log('Enhancement test result:', result);
  return result;
}