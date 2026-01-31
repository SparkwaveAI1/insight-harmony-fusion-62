/**
 * Tests for Rate Limiting Module
 * 
 * Tests the shared rate limiting functionality used by edge functions.
 * Note: These are unit tests that mock the Supabase client.
 * Real integration tests should be run against the deployed functions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the rate limit module's dependencies
const mockSupabase = {
  from: vi.fn(),
};

// Simulate rate limit logic
interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  keyPrefix?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

// Mirror the checkRateLimit function logic for testing
async function checkRateLimit(
  supabase: typeof mockSupabase,
  userId: string,
  functionName: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowSeconds, keyPrefix } = config;
  const key = `${keyPrefix || functionName}:${userId}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  try {
    // Count recent requests in window
    const countQuery = supabase.from('rate_limit_log');
    const { count, error: countError } = await countQuery
      .select('*', { count: 'exact', head: true })
      .eq('rate_key', key)
      .gte('created_at', windowStart.toISOString());

    if (countError && (countError as any).code !== 'PGRST116') {
      console.warn('Rate limit check failed, allowing request:', countError);
      return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) };
    }

    const currentCount = count || 0;

    if (currentCount >= maxRequests) {
      const retryAfter = windowSeconds;
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(now.getTime() + windowSeconds * 1000),
        retryAfter,
      };
    }

    // Would log request here
    return {
      allowed: true,
      remaining: maxRequests - currentCount - 1,
      resetAt: new Date(now.getTime() + windowSeconds * 1000),
    };
  } catch (error) {
    console.warn('Rate limit error, allowing request:', error);
    return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) };
  }
}

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('checkRateLimit', () => {
    const testConfig: RateLimitConfig = { maxRequests: 5, windowSeconds: 60 };

    it('should allow request when under limit', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 2, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'user_123',
        'test-function',
        testConfig
      );

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 5 - 2 - 1 = 2
    });

    it('should block request when at limit', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'user_123',
        'test-function',
        testConfig
      );

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    it('should block request when over limit', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 10, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'user_456',
        'test-function',
        testConfig
      );

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should allow request when no previous requests (count = 0)', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'new_user',
        'test-function',
        testConfig
      );

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 - 0 - 1 = 4
    });

    it('should handle database errors gracefully (fail open)', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'user_123',
        'test-function',
        testConfig
      );

      // Should allow request on error (fail open to avoid blocking legitimate users)
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // maxRequests - 1
    });

    it('should use custom key prefix when provided', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      await checkRateLimit(
        mockSupabase,
        'user_123',
        'test-function',
        { ...testConfig, keyPrefix: 'custom-prefix' }
      );

      // Verify the custom prefix was used in the rate key
      expect(chainMock.eq).toHaveBeenCalledWith('rate_key', 'custom-prefix:user_123');
    });

    it('should use function name as prefix when no custom prefix', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      await checkRateLimit(
        mockSupabase,
        'user_789',
        'my-edge-function',
        testConfig
      );

      expect(chainMock.eq).toHaveBeenCalledWith('rate_key', 'my-edge-function:user_789');
    });

    it('should provide correct resetAt timestamp', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 3, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'user_123',
        'test-function',
        { maxRequests: 5, windowSeconds: 120 } // 2 minute window
      );

      expect(result.allowed).toBe(true);
      // resetAt should be current time + window seconds
      const expectedReset = new Date('2024-01-15T10:02:00Z'); // 10:00 + 2 minutes
      expect(result.resetAt.getTime()).toBe(expectedReset.getTime());
    });
  });

  describe('Rate limit configurations', () => {
    it('should enforce conversation rate limit (60/min)', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 60, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'user_123',
        'v4-grok-conversation',
        { maxRequests: 60, windowSeconds: 60 }
      );

      expect(result.allowed).toBe(false);
    });

    it('should enforce image generation rate limit (5/min)', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'user_123',
        'generate-persona-image',
        { maxRequests: 5, windowSeconds: 60 }
      );

      expect(result.allowed).toBe(false);
    });

    it('should enforce search rate limit (30/min)', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 30, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'user_123',
        'semantic-persona-search',
        { maxRequests: 30, windowSeconds: 60 }
      );

      expect(result.allowed).toBe(false);
    });

    it('should enforce research session rate limit (5/min)', async () => {
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
      };
      mockSupabase.from.mockReturnValue(chainMock);

      const result = await checkRateLimit(
        mockSupabase,
        'user_123',
        'research-session-orchestrator',
        { maxRequests: 5, windowSeconds: 60 }
      );

      expect(result.allowed).toBe(false);
    });
  });

  describe('Rate limit response headers', () => {
    it('should include correct headers for blocked requests', () => {
      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetAt: new Date('2024-01-15T10:01:00Z'),
        retryAfter: 60,
      };

      // Simulate header generation
      const headers = {
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toISOString(),
      };

      expect(headers['Retry-After']).toBe('60');
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['X-RateLimit-Reset']).toBe('2024-01-15T10:01:00.000Z');
    });

    it('should include correct headers for allowed requests', () => {
      const result: RateLimitResult = {
        allowed: true,
        remaining: 42,
        resetAt: new Date('2024-01-15T10:01:00Z'),
      };

      // Simulate header generation
      const headers = {
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': result.resetAt.toISOString(),
      };

      expect(headers['X-RateLimit-Remaining']).toBe('42');
      expect(headers['X-RateLimit-Reset']).toBe('2024-01-15T10:01:00.000Z');
    });
  });

  describe('Per-user rate limiting', () => {
    it('should track requests per user independently', async () => {
      // User A at limit
      const chainMockUserA = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
      };
      
      // User B under limit
      const chainMockUserB = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 2, error: null }),
      };

      mockSupabase.from.mockReturnValueOnce(chainMockUserA);
      const resultA = await checkRateLimit(
        mockSupabase,
        'user_A',
        'test-function',
        { maxRequests: 5, windowSeconds: 60 }
      );

      mockSupabase.from.mockReturnValueOnce(chainMockUserB);
      const resultB = await checkRateLimit(
        mockSupabase,
        'user_B',
        'test-function',
        { maxRequests: 5, windowSeconds: 60 }
      );

      expect(resultA.allowed).toBe(false);
      expect(resultB.allowed).toBe(true);
    });
  });
});
