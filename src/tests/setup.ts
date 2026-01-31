/**
 * Vitest Test Setup
 * 
 * Global setup for all tests including mocks and utilities.
 */

import { vi } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless DEBUG=true
  log: process.env.DEBUG ? console.log : vi.fn(),
  warn: process.env.DEBUG ? console.warn : vi.fn(),
  error: console.error, // Always show errors
};
