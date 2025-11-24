/**
 * Date validation and formatting utilities
 * Handles German date format (DD.MM.YYYY) and ISO conversions
 */

import { format, parse, isValid, isBefore, isAfter, isFuture } from 'date-fns';
import { de } from 'date-fns/locale';

// German date format
export const GERMAN_DATE_FORMAT = 'dd.MM.yyyy';
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Validates if string is a valid German date (DD.MM.YYYY)
 */
export function isValidGermanDate(dateString: string): boolean {
  if (!dateString) return false;

  // Check format regex
  const regex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.(19|20)\d\d$/;
  if (!regex.test(dateString)) return false;

  // Parse and validate actual date
  const [day, month, year] = dateString.split('.').map(Number);
  const date = new Date(year, month - 1, day);

  return isValid(date) &&
         date.getDate() === day &&
         date.getMonth() === month - 1 &&
         date.getFullYear() === year;
}

/**
 * Checks if death date is after birth date
 */
export function isDeathAfterBirth(birthDateString: string, deathDateString: string): boolean {
  if (!isValidGermanDate(birthDateString) || !isValidGermanDate(deathDateString)) {
    return false;
  }

  const birthDate = germanDateToDate(birthDateString);
  const deathDate = germanDateToDate(deathDateString);

  return isAfter(deathDate, birthDate);
}

/**
 * Checks if date is in the future
 */
export function isDateInFuture(dateString: string): boolean {
  if (!isValidGermanDate(dateString)) return false;

  const date = germanDateToDate(dateString);
  return isFuture(date);
}

/**
 * Converts German date string (DD.MM.YYYY) to Date object
 */
export function germanDateToDate(dateString: string): Date {
  const [day, month, year] = dateString.split('.').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Converts German date string (DD.MM.YYYY) to ISO format (YYYY-MM-DD)
 */
export function germanDateToISO(dateString: string): string {
  if (!isValidGermanDate(dateString)) {
    throw new Error('Invalid German date format');
  }

  const date = germanDateToDate(dateString);
  return format(date, ISO_DATE_FORMAT);
}

/**
 * Converts ISO date string (YYYY-MM-DD) to German format (DD.MM.YYYY)
 */
export function isoDateToGerman(isoString: string): string {
  const date = new Date(isoString);
  if (!isValid(date)) {
    throw new Error('Invalid ISO date format');
  }

  return format(date, GERMAN_DATE_FORMAT, { locale: de });
}

/**
 * Formats Date object to German date string
 */
export function dateToGerman(date: Date): string {
  if (!isValid(date)) {
    throw new Error('Invalid date');
  }

  return format(date, GERMAN_DATE_FORMAT, { locale: de });
}

/**
 * Formats Date object to ISO date string
 */
export function dateToISO(date: Date): string {
  if (!isValid(date)) {
    throw new Error('Invalid date');
  }

  return format(date, ISO_DATE_FORMAT);
}

/**
 * Parses German date string to Date object safely
 * Returns null if invalid
 */
export function parseGermanDateSafe(dateString: string): Date | null {
  try {
    if (!isValidGermanDate(dateString)) return null;
    return germanDateToDate(dateString);
  } catch {
    return null;
  }
}

/**
 * Gets age in years from birth to death
 */
export function getAgeAtDeath(birthDateString: string, deathDateString: string): number | null {
  if (!isValidGermanDate(birthDateString) || !isValidGermanDate(deathDateString)) {
    return null;
  }

  const birthDate = germanDateToDate(birthDateString);
  const deathDate = germanDateToDate(deathDateString);

  let age = deathDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = deathDate.getMonth() - birthDate.getMonth();
  const dayDiff = deathDate.getDate() - birthDate.getDate();

  // Adjust if death date hasn't reached birthday yet
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/**
 * Formats date range in German
 * Example: "01.01.1950 - 31.12.2024"
 */
export function formatDateRange(
  startDateString: string,
  endDateString: string,
  separator: string = ' - '
): string {
  return `${startDateString}${separator}${endDateString}`;
}

/**
 * Auto-corrects common German date input errors
 * Examples:
 * - "1.1.2024" → "01.01.2024"
 * - "31/12/2024" → "31.12.2024"
 */
export function autoCorrectGermanDate(input: string): string {
  // Replace slashes with dots
  let corrected = input.replace(/\//g, '.');

  // Pad single digits
  const parts = corrected.split('.');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
  }

  return corrected;
}
