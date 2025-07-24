/**
 * Input validation utilities for security
 */

// Maximum message length to prevent resource exhaustion
const MAX_MESSAGE_LENGTH = 10000;
const MAX_PERSONA_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

export const validateMessage = (message: string): { isValid: boolean; error?: string } => {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message is required and must be a string' };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { isValid: false, error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
  }

  // Check for potential XSS patterns (basic protection)
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(message)) {
      return { isValid: false, error: 'Message contains potentially unsafe content' };
    }
  }

  return { isValid: true };
};

export const validatePersonaName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required and must be a string' };
  }

  if (name.length > MAX_PERSONA_NAME_LENGTH) {
    return { isValid: false, error: `Name exceeds maximum length of ${MAX_PERSONA_NAME_LENGTH} characters` };
  }

  // Allow letters, numbers, spaces, and common punctuation
  if (!/^[a-zA-Z0-9\s\-'.]+$/.test(name)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }

  return { isValid: true };
};

export const validateDescription = (description: string): { isValid: boolean; error?: string } => {
  if (!description || typeof description !== 'string') {
    return { isValid: false, error: 'Description is required and must be a string' };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { isValid: false, error: `Description exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters` };
  }

  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const validatePersonaId = (personaId: string): { isValid: boolean; error?: string } => {
  if (!personaId || typeof personaId !== 'string') {
    return { isValid: false, error: 'Persona ID is required and must be a string' };
  }

  // Persona IDs should be alphanumeric with hyphens/underscores
  if (!/^[a-zA-Z0-9\-_]+$/.test(personaId)) {
    return { isValid: false, error: 'Invalid persona ID format' };
  }

  if (personaId.length > 50) {
    return { isValid: false, error: 'Persona ID too long' };
  }

  return { isValid: true };
};