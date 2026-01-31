/**
 * Rate Limiting Module for Edge Functions
 * Uses Supabase to track request counts per user with sliding window
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RateLimitConfig {
  maxRequests: number      // Max requests allowed in window
  windowSeconds: number    // Window size in seconds
  keyPrefix?: string       // Optional prefix for rate limit key
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  retryAfter?: number      // Seconds until reset (if blocked)
}

// Default configs for different function types
export const RATE_LIMITS = {
  conversation: { maxRequests: 60, windowSeconds: 60 },    // 60/min for chat
  persona_creation: { maxRequests: 10, windowSeconds: 60 }, // 10/min for heavy operations
  search: { maxRequests: 100, windowSeconds: 60 },          // 100/min for search
  admin: { maxRequests: 30, windowSeconds: 60 },            // 30/min for admin ops
} as const

/**
 * Check and update rate limit for a user
 * Uses a simple sliding window counter stored in a dedicated table
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  functionName: string,
  config: RateLimitConfig = RATE_LIMITS.conversation
): Promise<RateLimitResult> {
  const { maxRequests, windowSeconds, keyPrefix } = config
  const key = `${keyPrefix || functionName}:${userId}`
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowSeconds * 1000)
  
  try {
    // Count recent requests in window
    const { count, error: countError } = await supabase
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('rate_key', key)
      .gte('created_at', windowStart.toISOString())
    
    if (countError && countError.code !== 'PGRST116') {
      // If table doesn't exist or other error, allow request but log warning
      console.warn('Rate limit check failed, allowing request:', countError)
      return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) }
    }
    
    const currentCount = count || 0
    
    if (currentCount >= maxRequests) {
      // Rate limited - calculate retry time
      const { data: oldestInWindow } = await supabase
        .from('rate_limit_log')
        .select('created_at')
        .eq('rate_key', key)
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
      
      const oldestTime = oldestInWindow?.created_at 
        ? new Date(oldestInWindow.created_at) 
        : windowStart
      const retryAfter = Math.ceil((oldestTime.getTime() + windowSeconds * 1000 - now.getTime()) / 1000)
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(oldestTime.getTime() + windowSeconds * 1000),
        retryAfter: Math.max(1, retryAfter)
      }
    }
    
    // Log this request
    await supabase
      .from('rate_limit_log')
      .insert({ rate_key: key, user_id: userId, function_name: functionName })
    
    return {
      allowed: true,
      remaining: maxRequests - currentCount - 1,
      resetAt: new Date(now.getTime() + windowSeconds * 1000)
    }
    
  } catch (error) {
    // On any error, allow request to avoid blocking legitimate users
    console.warn('Rate limit error, allowing request:', error)
    return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) }
  }
}

/**
 * Returns a 429 response with proper headers
 */
export function rateLimitResponse(result: RateLimitResult, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: result.retryAfter,
      resetAt: result.resetAt.toISOString()
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toISOString()
      }
    }
  )
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(headers: Record<string, string>, result: RateLimitResult): Record<string, string> {
  return {
    ...headers,
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString()
  }
}
