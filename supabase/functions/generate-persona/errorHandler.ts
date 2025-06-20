
export interface ErrorDetails {
  step: string;
  error: Error;
  context?: any;
}

export class PersonaGenerationError extends Error {
  public step: string;
  public originalError?: Error;
  public context?: any;
  
  constructor(step: string, message: string, originalError?: Error, context?: any) {
    super(message);
    this.name = 'PersonaGenerationError';
    this.step = step;
    this.originalError = originalError;
    this.context = context;
  }
}

export function handleGenerationError(errorDetails: ErrorDetails): Response {
  const { step, error, context } = errorDetails;
  
  console.error(`=== PERSONA GENERATION ERROR ===`);
  console.error(`Step: ${step}`);
  console.error(`Error: ${error.message}`);
  console.error(`Stack: ${error.stack}`);
  if (context) {
    console.error(`Context:`, context);
  }
  console.error(`=== END ERROR ===`);
  
  // Determine user-friendly error message based on step
  let userMessage = 'Failed to generate persona';
  let statusCode = 500;
  
  switch (step) {
    case 'validation':
      userMessage = `Invalid input: ${error.message}`;
      statusCode = 400;
      break;
    case 'demographics':
      userMessage = 'Failed to generate persona demographics. Please try a more detailed prompt.';
      break;
    case 'traits':
      userMessage = 'Failed to generate persona traits. The AI service may be temporarily unavailable.';
      break;
    case 'interview':
      userMessage = 'Failed to generate interview responses. Persona saved with basic information only.';
      statusCode = 200; // Partial success
      break;
    case 'database':
      userMessage = 'Failed to save persona to database. Please try again.';
      break;
    case 'openai':
      if (error.message.includes('rate limit')) {
        userMessage = 'AI service rate limit exceeded. Please wait a moment and try again.';
        statusCode = 429;
      } else if (error.message.includes('quota')) {
        userMessage = 'AI service quota exceeded. Please check your API key configuration.';
        statusCode = 402;
      } else {
        userMessage = 'AI service error. Please try again with a different prompt.';
      }
      break;
    default:
      userMessage = `Generation failed at ${step}: ${error.message}`;
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      error: userMessage,
      step,
      details: error.message,
      context
    }),
    {
      status: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json'
      }
    }
  );
}

export function wrapWithErrorHandling<T>(
  fn: () => Promise<T>,
  step: string,
  context?: any
): Promise<T> {
  return fn().catch((error) => {
    throw new PersonaGenerationError(step, error.message, error, context);
  });
}
