
// Export the Supabase client
import { supabase } from '@/integrations/supabase/client';

// These functions are not currently available but may be restored later
// Export participant types and functions would go here
// Export questionnaire functions would go here
// Export interview functions would go here
// Export storage functions would go here

export {
  uploadPersonaImageFromUrl,
  savePersonaProfileImage
} from './storage/imageUploadService';

export {
  ensureStorageBuckets
} from './storage/bucketService';

// Export profiles table creation function
export { 
  createProfilesTable, 
  getProfilesTableSQL 
} from './createProfilesTable';

// Re-export the Supabase client
export { supabase };
