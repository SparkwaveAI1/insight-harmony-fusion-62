import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updatePersonaVisibility } from '@/services/persona';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const PersonaToggleDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testToggle = async () => {
    setIsLoading(true);
    const personaId = 'v4_1758469341114_nwkl7ch8lfj'; // Tasha Robinson
    
    try {
      // 1. Get current state
      console.log('🔍 Step 1: Getting current persona state...');
      const { data: beforeUpdate, error: fetchError } = await supabase
        .from('v4_personas')
        .select('persona_id, name, is_public')
        .eq('persona_id', personaId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log('📊 Current state:', beforeUpdate);

      // 2. Toggle visibility
      const newVisibility = !beforeUpdate.is_public;
      console.log(`🔄 Step 2: Toggling visibility to ${newVisibility}...`);
      
      const success = await updatePersonaVisibility(personaId, newVisibility);
      console.log('✅ Toggle result:', success);

      // 3. Verify update
      console.log('🔍 Step 3: Verifying update...');
      const { data: afterUpdate, error: verifyError } = await supabase
        .from('v4_personas')
        .select('persona_id, name, is_public')
        .eq('persona_id', personaId)
        .single();

      if (verifyError) {
        throw verifyError;
      }

      console.log('📊 After update:', afterUpdate);

      const debugResult = {
        beforeUpdate,
        toggleResult: success,
        afterUpdate,
        success: success && (afterUpdate.is_public === newVisibility),
        expectedVisibility: newVisibility,
        actualVisibility: afterUpdate.is_public,
        visibilityMatches: afterUpdate.is_public === newVisibility
      };

      setDebugInfo(debugResult);

      if (debugResult.success) {
        toast.success(`✅ Toggle test successful! Visibility is now ${newVisibility ? 'PUBLIC' : 'PRIVATE'}`);
      } else {
        toast.error('❌ Toggle test failed - visibility not updated correctly');
      }

    } catch (error) {
      console.error('❌ Toggle test error:', error);
      setDebugInfo({ error: error.message });
      toast.error('Toggle test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Persona Toggle Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testToggle} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing Toggle...' : 'Test Persona Toggle (Tasha Robinson)'}
        </Button>

        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded-lg text-sm">
            <h3 className="font-bold mb-2">Debug Results:</h3>
            <pre className="whitespace-pre-wrap overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};