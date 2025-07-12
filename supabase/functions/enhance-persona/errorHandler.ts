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

export function handleGenerationError(error: PersonaGenerationError): Response {
  console.error(`=== PERSONA GENERATION ERROR ===`);
  console.error(`Step: ${error.step}`);
  console.error(`Error: ${error.message}`);
  console.error(`Stack: ${error.stack}`);
  if (error.context) {
    console.error(`Context:`, error.context);
  }
  console.error(`=== END ERROR ===`);
  
  // Determine user-friendly error message based on step
  let userMessage = 'Failed to enhance persona';
  let statusCode = 500;
  
  switch (error.step) {
    case 'validation':
      userMessage = `Invalid input: ${error.message}`;
      statusCode = 400;
      break;
    case 'authentication':
      userMessage = 'Authentication failed';
      statusCode = 401;
      break;
    case 'database':
      userMessage = 'Failed to save enhanced persona to database. Please try again.';
      break;
    case 'openai':
      if (error.message.includes('rate limit')) {
        userMessage = 'AI service rate limit exceeded. Please wait a moment and try again.';
        statusCode = 429;
      } else if (error.message.includes('quota')) {
        userMessage = 'AI service quota exceeded. Please check your API key configuration.';
        statusCode = 402;
      } else {
        userMessage = 'AI service error. Please try again.';
      }
      break;
    default:
      userMessage = `Enhancement failed at ${error.step}: ${error.message}`;
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      error: userMessage,
      step: error.step,
      details: error.message,
      context: error.context
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