
import { backfillAppearancePrompts } from './backfillAppearancePrompts';

// Utility function to run the backfill from browser console
export const runBackfillFromConsole = async (): Promise<void> => {
  try {
    console.log('🚀 Starting appearance prompt backfill...');
    await backfillAppearancePrompts();
    console.log('✅ Backfill completed successfully!');
  } catch (error) {
    console.error('❌ Backfill failed:', error);
  }
};

// Make it available globally for easy access from browser console
if (typeof window !== 'undefined') {
  (window as any).runBackfillAppearancePrompts = runBackfillFromConsole;
}
