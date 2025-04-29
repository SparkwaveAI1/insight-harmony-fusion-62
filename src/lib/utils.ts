
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a full name to display only first name and initial of surname
 * Example: "John Smith" becomes "John S."
 * @param fullName The complete name to format
 * @returns Formatted name with just first name and surname initial
 */
export function formatName(fullName: string): string {
  if (!fullName) return '';
  
  const nameParts = fullName.trim().split(' ');
  
  // If there's only one part, return it as is
  if (nameParts.length === 1) {
    return nameParts[0];
  }
  
  // Get the first name
  const firstName = nameParts[0];
  
  // Get the last name's initial (last part of the name)
  const lastNameInitial = nameParts[nameParts.length - 1].charAt(0);
  
  // Return formatted name
  return `${firstName} ${lastNameInitial}.`;
}

/**
 * Formats a date string into a localized date string
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export function formatDateString(dateString: string): string {
  if (!dateString) return "Unknown";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return dateString;
  }
}
