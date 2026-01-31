/**
 * Tests for API Key Utilities - Secure Storage
 * 
 * Tests the secure server-side API key storage system.
 * Ensures keys are NOT stored in localStorage (XSS vulnerability).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock sessionStorage and localStorage
const mockSessionStorage: Record<string, string> = {};
const mockLocalStorage: Record<string, string> = {};

vi.stubGlobal('sessionStorage', {
  getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockSessionStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockSessionStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]); }),
});

vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }),
});

// Import after mocking globals
import {
  isAuthenticated,
  setApiKey,
  getApiKey,
  getApiKeySync,
  getApiKeys,
  removeApiKey,
  clearApiKeys,
  initializeApiKeyStorage,
} from '@/services/utils/apiKeyUtils';

describe('apiKeyUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear mock storages
    Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]);
    Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should return true when session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      const result = await isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false when no session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('setApiKey', () => {
    it('should store key via edge function for authenticated users', async () => {
      // Mock authenticated session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      // Mock successful edge function call
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      } as any);

      const result = await setApiKey('openai', 'sk-test-key-12345');

      expect(result).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('store-api-key', {
        body: { apiKey: 'sk-test-key-12345', service: 'openai' },
      });
      // Should set session storage flag
      expect(sessionStorage.setItem).toHaveBeenCalledWith('openai_key_stored', 'true');
    });

    it('should return false for unauthenticated users', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await setApiKey('openai', 'sk-test-key');

      expect(result).toBe(false);
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('should return false on edge function error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Storage error' },
      } as any);

      const result = await setApiKey('openai', 'sk-test-key');

      expect(result).toBe(false);
    });

    it('should clean up legacy localStorage entries', async () => {
      // Add legacy localStorage entry
      mockLocalStorage['openai_key_stored'] = 'true';
      mockLocalStorage['apiKeys'] = JSON.stringify({ openai: 'old-key' });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      } as any);

      await setApiKey('openai', 'new-key');

      // Should clean up localStorage
      expect(localStorage.removeItem).toHaveBeenCalledWith('apiKeys');
      expect(localStorage.removeItem).toHaveBeenCalledWith('openai_key_stored');
    });
  });

  describe('getApiKey', () => {
    it('should return stored-key marker when key exists server-side', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      // Mock database check
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { key_present: true },
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await getApiKey('openai');

      expect(result).toBe('stored-key');
      // Should cache in sessionStorage
      expect(sessionStorage.setItem).toHaveBeenCalledWith('openai_key_stored', 'true');
    });

    it('should return from session storage cache (fast path)', async () => {
      // Set session storage flag
      mockSessionStorage['openai_key_stored'] = 'true';

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      const result = await getApiKey('openai');

      expect(result).toBe('stored-key');
      // Should NOT query database (fast path)
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return null for unauthenticated users', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await getApiKey('openai');

      expect(result).toBeNull();
    });

    it('should return null when no key exists server-side', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await getApiKey('anthropic');

      expect(result).toBeNull();
    });
  });

  describe('getApiKeySync', () => {
    it('should return stored-key when session flag exists', () => {
      mockSessionStorage['openai_key_stored'] = 'true';

      const result = getApiKeySync('openai');

      expect(result).toBe('stored-key');
    });

    it('should return null when no session flag', () => {
      const result = getApiKeySync('openai');

      expect(result).toBeNull();
    });
  });

  describe('getApiKeys', () => {
    it('should return map of stored services', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { service: 'openai', key_present: true },
              { service: 'anthropic', key_present: true },
              { service: 'grok', key_present: false },
            ],
            error: null,
          }),
        }),
      } as any);

      const result = await getApiKeys();

      expect(result).toEqual({
        openai: true,
        anthropic: true,
      });
      expect(result.grok).toBeUndefined();
    });

    it('should return empty object for unauthenticated users', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await getApiKeys();

      expect(result).toEqual({});
    });
  });

  describe('removeApiKey', () => {
    it('should remove key via edge function for authenticated users', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      } as any);

      const result = await removeApiKey('openai');

      expect(result).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('remove-api-key', {
        body: { service: 'openai' },
      });
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('openai_key_stored');
    });

    it('should clear session storage even for unauthenticated users', async () => {
      mockSessionStorage['openai_key_stored'] = 'true';

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await removeApiKey('openai');

      expect(result).toBe(true);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('openai_key_stored');
    });
  });

  describe('clearApiKeys', () => {
    it('should clear all service keys', async () => {
      mockSessionStorage['openai_key_stored'] = 'true';
      mockSessionStorage['anthropic_key_stored'] = 'true';
      mockLocalStorage['apiKeys'] = '{}';

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      } as any);

      await clearApiKeys();

      // Should clear session storage for all services
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('openai_key_stored');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('anthropic_key_stored');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('grok_key_stored');
      // Should clean up legacy localStorage
      expect(localStorage.removeItem).toHaveBeenCalledWith('apiKeys');
    });
  });

  describe('initializeApiKeyStorage', () => {
    it('should sync session storage with server state', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { service: 'openai', key_present: true },
              { service: 'anthropic', key_present: false },
            ],
            error: null,
          }),
        }),
      } as any);

      await initializeApiKeyStorage();

      // Should set flag for existing key
      expect(sessionStorage.setItem).toHaveBeenCalledWith('openai_key_stored', 'true');
      // Should remove flag for non-existing key
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('anthropic_key_stored');
    });

    it('should clean up legacy localStorage on init', async () => {
      mockLocalStorage['apiKeys'] = JSON.stringify({ openai: 'old-key' });
      mockLocalStorage['openai_key_stored'] = 'true';

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      await initializeApiKeyStorage();

      expect(localStorage.removeItem).toHaveBeenCalledWith('apiKeys');
    });
  });

  describe('Security: No localStorage key storage', () => {
    it('should NEVER store actual API keys in localStorage', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      } as any);

      // Store multiple keys
      await setApiKey('openai', 'sk-very-secret-key-12345');
      await setApiKey('anthropic', 'sk-ant-another-secret');

      // Verify NO calls to localStorage.setItem with key-like values
      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
      for (const [key, value] of setItemCalls) {
        expect(value).not.toContain('sk-');
        expect(value).not.toContain('secret');
        expect(key).not.toBe('apiKeys');
      }

      // Verify only session storage gets the 'true' marker
      const sessionSetItemCalls = vi.mocked(sessionStorage.setItem).mock.calls;
      for (const [key, value] of sessionSetItemCalls) {
        expect(value).toBe('true'); // Only boolean marker, never the actual key
      }
    });

    it('should not expose keys through getApiKey', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { key_present: true },
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await getApiKey('openai');

      // Should return marker, not actual key
      expect(result).toBe('stored-key');
      expect(result).not.toContain('sk-');
    });
  });
});
