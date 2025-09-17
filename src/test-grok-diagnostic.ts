// Test script to trigger conversation and check diagnostic logs
import { sendV4GrokMessage } from './services/v4-persona/conversationGrok';
import { getV4Personas } from './services/v4-persona/getV4Personas';

export async function testGrokDiagnostic() {
  console.log('🧪 Testing Grok diagnostic logs...');
  
  // Get first available persona instead of hardcoding
  const personas = await getV4Personas('');
  if (personas.length === 0) {
    console.log('❌ No personas available for testing');
    return;
  }
  
  const testPersonaId = personas[0].persona_id;
  const testMessage = `Hi ${personas[0].name}, can you tell me about your expertise?`;
  
  try {
    console.log('📞 Calling v4-grok-conversation edge function...');
    const response = await sendV4GrokMessage({
      persona_id: testPersonaId,
      user_message: testMessage,
      conversation_history: []
    });
    
    console.log('✅ Conversation test completed');
    console.log('Response success:', response.success);
    console.log('Persona name:', response.persona_name);
    console.log('Response preview:', response.response?.substring(0, 100) + '...');
    console.log('🔍 Check edge function logs for diagnostic output');
    
    return response;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Make the function globally available for manual testing
if (typeof window !== 'undefined') {
  (window as any).testGrok = testGrokDiagnostic;
  
  // Auto-execute when this file is imported
  console.log('🚀 Grok diagnostic test loaded - call testGrok() manually or wait for auto-execution');
  setTimeout(() => {
    console.log('🕐 Auto-starting Grok diagnostic test in 3 seconds...');
    testGrokDiagnostic();
  }, 3000);
}