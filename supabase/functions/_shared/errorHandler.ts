/**
 * Standardized Error Handling for Edge Functions
 * Provides consistent error responses and logging
 */

export interface ErrorContext {
  functionName: string
  userId?: string
  personaId?: string
  extra?: Record<string, unknown>
}

export interface StandardError {
  success: false
  error: string
  code?: string
  details?: Record<string, unknown>
}

/**
 * Log an error with context
 */
export function logError(error: unknown, context: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  
  console.error(`❌ [${context.functionName}] Error:`, {
    message: errorMessage,
    stack: errorStack,
    userId: context.userId,
    personaId: context.personaId,
    ...context.extra,
    timestamp: new Date().toISOString()
  })
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  context: ErrorContext,
  corsHeaders: Record<string, string>,
  statusCode: number = 500
): Response {
  logError(error, context)
  
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
  
  // Determine error code based on message patterns
  let code = 'INTERNAL_ERROR'
  if (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('authentication')) {
    code = 'AUTH_ERROR'
    statusCode = 401
  } else if (errorMessage.toLowerCase().includes('not found')) {
    code = 'NOT_FOUND'
    statusCode = 404
  } else if (errorMessage.toLowerCase().includes('validation') || errorMessage.toLowerCase().includes('required')) {
    code = 'VALIDATION_ERROR'
    statusCode = 400
  } else if (errorMessage.toLowerCase().includes('rate limit')) {
    code = 'RATE_LIMITED'
    statusCode = 429
  }
  
  const body: StandardError = {
    success: false,
    error: errorMessage,
    code
  }
  
  // Add debug details in non-production (optional)
  if (Deno.env.get('ENVIRONMENT') === 'development') {
    body.details = {
      function: context.functionName,
      timestamp: new Date().toISOString()
    }
  }
  
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: ErrorContext,
  corsHeaders: Record<string, string>
): Promise<T | Response> {
  return fn().catch((error) => createErrorResponse(error, context, corsHeaders))
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(field => !body[field])
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`)
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}
