// FRESH PERSONA SERVICE - Nuclear deployment verification
// This service exists ONLY in fresh deployments to test V4 access
import { supabase } from '@/integrations/supabase/client';

const FRESH_SERVICE_ID = `FRESH_PERSONA_SERVICE_${Date.now()}`;

export class FreshPersonaService {
  static async testFreshV4Access() {
    console.log(`🚨 FRESH PERSONA SERVICE ACTIVE: ${FRESH_SERVICE_ID}`);
    console.log(`🔥 Testing V4 personas from COMPLETELY NEW service...`);
    
    try {
      const { data, error } = await supabase
        .from('v4_personas')
        .select('persona_id, name, user_id')
        .limit(5);
      
      if (error) {
        console.error(`❌ FRESH SERVICE: V4 access failed:`, error);
        return { success: false, error };
      } else {
        console.log(`✅ FRESH SERVICE SUCCESS: V4 personas accessible!`, data?.length || 0, 'personas found');
        return { success: true, data };
      }
    } catch (err) {
      console.error(`❌ FRESH SERVICE: Exception:`, err);
      return { success: false, error: err };
    }
  }

  static getFreshServiceId() {
    return FRESH_SERVICE_ID;
  }
}

// Auto-test on service creation
FreshPersonaService.testFreshV4Access();