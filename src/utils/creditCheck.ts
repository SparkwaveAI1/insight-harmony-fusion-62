import { supabase } from '@/integrations/supabase/client';

export async function checkUserCredits(userId: string, requiredCredits: number) {
  try {
    const { data, error } = await supabase
      .from('billing_credit_available') 
      .select('available')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error checking credits:', error);
      return {
        hasEnoughCredits: false,
        currentBalance: 0
      };
    }
    
    return {
      hasEnoughCredits: (data?.available || 0) >= requiredCredits,
      currentBalance: data?.available || 0
    };
  } catch (error) {
    console.error('Credit check failed:', error);
    return {
      hasEnoughCredits: false,
      currentBalance: 0
    };
  }
}