
/**
 * Generates a random 6-digit identifier number
 * @returns A string containing a 6-digit number
 */
export const generateUniqueIdentifier = (): string => {
  // Generate a random number between 100000 and 999999
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return randomNumber.toString();
};

/**
 * Validates if a string is a valid 6-digit identifier
 * @param id The string to validate
 * @returns Boolean indicating if valid
 */
export const isValidIdentifier = (id: string): boolean => {
  return /^\d{6}$/.test(id);
};
