/**
 * Name Formatter Utility
 *
 * Formats full names for memorial display according to German conventions
 */

export interface MemorialNameFields {
  type?: string;
  first_name: string;
  last_name?: string | null;
  title?: string | null;
  second_name?: string | null;
  third_name?: string | null;
  nickname?: string | null;
  name_suffix?: string | null;
  birth_name?: string | null;
  salutation?: string | null;
  gender?: string | null;
}

/**
 * Formats a full name according to German naming conventions
 *
 * Order: Titel Vorname ZweiterVorname DritterVorname "Spitzname" Namenszusatz Nachname (geb. Geburtsname)
 *
 * Example: Dr. Max Wolfgang Moritz "Strubbel" von Musterfrau (geb. Mustermann)
 *
 * @param memorial - Memorial object with name fields
 * @returns Formatted full name string
 */
export function formatFullName(memorial: MemorialNameFields): string {
  // For animals, just return the first name
  if (memorial.type === 'animal' || memorial.type === 'tier') {
    return memorial.first_name;
  }

  const parts: string[] = [];

  // 1. Titel (e.g., Dr., Prof.)
  if (memorial.title) {
    parts.push(memorial.title.trim());
  }

  // 2. Vorname (required)
  parts.push(memorial.first_name.trim());

  // 3. Zweiter Vorname
  if (memorial.second_name) {
    parts.push(memorial.second_name.trim());
  }

  // 4. Dritter Vorname
  if (memorial.third_name) {
    parts.push(memorial.third_name.trim());
  }

  // 5. Spitzname (in quotes)
  if (memorial.nickname) {
    parts.push(`"${memorial.nickname.trim()}"`);
  }

  // 6. Namenszusatz (e.g., von, zu)
  if (memorial.name_suffix) {
    parts.push(memorial.name_suffix.trim());
  }

  // 7. Nachname
  if (memorial.last_name) {
    parts.push(memorial.last_name.trim());
  }

  // 8. Geburtsname (in parentheses with "geb.")
  let fullName = parts.join(' ');
  if (memorial.birth_name) {
    fullName += ` (geb. ${memorial.birth_name.trim()})`;
  }

  return fullName;
}

/**
 * Formats a compact name (just first and last name)
 *
 * @param memorial - Memorial object with name fields
 * @returns Compact name string
 */
export function formatCompactName(memorial: MemorialNameFields): string {
  if (memorial.type === 'animal' || memorial.type === 'tier') {
    return memorial.first_name;
  }

  if (memorial.last_name) {
    return `${memorial.first_name} ${memorial.last_name}`;
  }

  return memorial.first_name;
}
