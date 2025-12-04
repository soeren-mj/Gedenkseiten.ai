import { format, isToday, isYesterday, differenceInMinutes, differenceInHours } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Formats a date as a relative time string in German
 *
 * Examples:
 * - < 1 min: "Gerade eben"
 * - < 60 min: "vor X Minuten"
 * - < 24 hours: "vor X Stunden"
 * - Yesterday: "Gestern um HH:mm"
 * - Older: "DD.MM.YYYY"
 *
 * @param date - The date to format (string or Date)
 * @returns A human-readable relative time string in German
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  const diffMinutes = differenceInMinutes(now, d);
  const diffHours = differenceInHours(now, d);

  // Less than 1 minute
  if (diffMinutes < 1) {
    return 'Gerade eben';
  }

  // Less than 60 minutes
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? 'vor 1 Minute' : `vor ${diffMinutes} Minuten`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return diffHours === 1 ? 'vor 1 Stunde' : `vor ${diffHours} Stunden`;
  }

  // Yesterday
  if (isYesterday(d)) {
    return `Gestern um ${format(d, 'HH:mm', { locale: de })}`;
  }

  // Today (should not reach here due to < 24h check, but included for safety)
  if (isToday(d)) {
    return `Heute um ${format(d, 'HH:mm', { locale: de })}`;
  }

  // Older dates
  return format(d, 'dd.MM.yyyy', { locale: de });
}

/**
 * Formats a date as a full date string in German
 *
 * @param date - The date to format (string or Date)
 * @returns A full date string like "01.01.2024"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd.MM.yyyy', { locale: de });
}

/**
 * Formats a date with time in German
 *
 * @param date - The date to format (string or Date)
 * @returns A full date/time string like "01.01.2024 um 14:30"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "dd.MM.yyyy 'um' HH:mm", { locale: de });
}
