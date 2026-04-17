// NUCLEAR DEPLOYMENT VERIFICATION COMPONENT
// This component exists ONLY to verify fresh deployment
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEPLOYMENT_SIGNATURE = `NUCLEAR_FRESH_DEPLOYMENT_${Date.now()}`;

export function DeploymentVerifier() {
  useEffect(() => {
    console.log(`🚨 DEPLOYMENT VERIFIER LOADED: ${DEPLOYMENT_SIGNATURE}`);
    console.log(`🔥 This component should ONLY exist in FRESH deployments`);
    
    // Test V4 personas access directly
    const testV4Access = async () => {
      try {
        console.log(`🧪 Testing V4 personas access from fresh component...`);
        const { data, error } = await supabase
          .from('v4_personas')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error(`❌ V4 personas access failed:`, error);
        } else {
          console.log(`✅ SUCCESS: V4 personas accessible from fresh component!`, data);
        }
      } catch (err) {
        console.error(`❌ V4 personas test error:`, err);
      }
    };

    testV4Access();
  }, []);

  return (
    <div className="hidden">
      {/* Hidden verification component - logs to console only */}
      DEPLOYMENT_VERIFICATION_ACTIVE_{DEPLOYMENT_SIGNATURE}
    </div>
  );
}