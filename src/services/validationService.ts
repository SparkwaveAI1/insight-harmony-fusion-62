
import { toast } from 'sonner';

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationService {
  static validateRequired<T>(value: T, fieldName: string): ValidationResult {
    const isValid = value !== null && value !== undefined && 
                   (typeof value !== 'string' || value.trim().length > 0);
    
    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} is required`]
    };
  }

  static validateLength(value: string, min: number, max: number, fieldName: string): ValidationResult {
    const length = value?.length || 0;
    const isValid = length >= min && length <= max;
    
    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} must be between ${min} and ${max} characters`]
    };
  }

  static validateMultiple<T>(value: T, rules: ValidationRule<T>[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateMessageInput(message: string, file?: File): ValidationResult {
    if (!message.trim() && !file) {
      return {
        isValid: false,
        errors: ['Please enter a message or attach a file']
      };
    }

    if (message.length > 2000) {
      return {
        isValid: false,
        errors: ['Message is too long. Maximum 2000 characters allowed.']
      };
    }

    return { isValid: true, errors: [] };
  }

  static validatePersonaId(personaId: string): ValidationResult {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    return {
      isValid: uuidRegex.test(personaId),
      errors: uuidRegex.test(personaId) ? [] : ['Invalid persona ID format']
    };
  }

  static showValidationErrors(errors: string[]): void {
    errors.forEach(error => toast.error(error));
  }
}
