// Export test suite for easy access
export { VoicepackTestSuite } from './VoicepackTestSuite';
export type { TestResult } from './VoicepackTestSuite';

// Export controller and post-processor for chat runtime
export { classifyTurn, planTurn, updateStateFromText } from '../../conversation/controller';
export { postProcess, analyzeResponse } from '../../conversation/postProcess';

// Export prompt utilities
export {
  serializeVoicepack,
  serializePlan,
  pickTempFromTraits,
  pickPresencePenalty,
  pickFrequencyPenalty,
  pickMaxTokens,
  createSystemPrompt
} from '../utils/promptUtils';

// Convenience function to run tests
export async function runVoicepackTests() {
  const { VoicepackTestSuite } = await import('./VoicepackTestSuite');
  const testSuite = new VoicepackTestSuite();
  return await testSuite.runAllTests();
}