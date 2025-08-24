// Test script to trigger David Kim conversation and check diagnostic logs
import { sendV4GrokMessage } from './services/v4-persona/conversationGrok';

export async function testDavidKimDiagnostic() {
  console.log('🧪 Testing David Kim diagnostic logs...');
  
  const davidKimPersonaId = 'v4_1755997146752_t9i0orv9k';
  const testMessage = 'Hi David, can you tell me about your real estate expertise?';
  
  try {
    console.log('📞 Calling v4-grok-conversation edge function...');
    const response = await sendV4GrokMessage({
      persona_id: davidKimPersonaId,
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
  (window as any).testDavidKim = testDavidKimDiagnostic;
  
  // Auto-execute when this file is imported
  console.log('🚀 David Kim diagnostic test loaded - call testDavidKim() manually or wait for auto-execution');
  setTimeout(() => {
    console.log('🕐 Auto-starting David Kim diagnostic test in 3 seconds...');
    testDavidKimDiagnostic();
  }, 3000);
}