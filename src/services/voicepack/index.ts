// Export the main services
export { PersonaV2Compiler } from './PersonaV2Compiler';
export { VoicepackCacheService } from './VoicepackCacheService';

// Export engines
export { TraitSynthesisEngine } from './engines/TraitSynthesisEngine';
export { LinguisticCompiler } from './engines/LinguisticCompiler';
export { StateHookEngine } from './engines/StateHookEngine';
export { SignatureEngine } from './engines/SignatureEngine';

// Create singleton instance for easy use  
import { VoicepackCacheService } from './VoicepackCacheService';
const voicepackCacheService = new VoicepackCacheService();
export const voicepackCache = voicepackCacheService;

// Convenience function for getting voicepacks
export async function getOrCompileVoicepack(personaId: string) {
  return voicepackCache.getOrCompileVoicepack(personaId);
}