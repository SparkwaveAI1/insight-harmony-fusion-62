
import { ensureTablesExist, displayParticipantsTableInfo } from './database/tableService';
import { getSetupSQLScripts } from './database/setupScripts';

/**
 * Database function type definitions for better TypeScript support
 */
export interface DatabaseFunctions {
  table_exists: {
    Args: { table_name: string };
    Returns: { exists: boolean };
  }
}

// Re-export everything for backward compatibility
export { ensureTablesExist, displayParticipantsTableInfo, getSetupSQLScripts };
