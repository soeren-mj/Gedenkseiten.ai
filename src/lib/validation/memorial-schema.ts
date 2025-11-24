/**
 * Zod validation schemas for memorial creation flow
 */

import { z } from 'zod';

// Custom error messages in German
const errorMessages = {
  required: 'Dieses Feld ist erforderlich',
  invalid_email: 'Ungültige E-Mail-Adresse',
  invalid_date: 'Ungültiges Datum',
  date_in_future: 'Das Datum darf nicht in der Zukunft liegen',
  death_before_birth: 'Sterbedatum muss nach dem Geburtsdatum liegen',
  string_too_long: (max: number) => `Maximal ${max} Zeichen erlaubt`,
  string_too_short: (min: number) => `Mindestens ${min} Zeichen erforderlich`,
};

// Helper: Validate ISO date format YYYY-MM-DD
const isoDateString = z.string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Ungültiges Datumsformat'
  )
  .refine((dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }, 'Ungültiges Datum');

// Helper: Validate date is not in future
const notInFuture = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return date <= today;
};

// ============================================================================
// PERSON-SPECIFIC SCHEMAS
// ============================================================================

export const personBasicInfoSchema = z.object({
  // Required fields
  first_name: z.string()
    .min(1, errorMessages.required)
    .max(100, errorMessages.string_too_long(100)),

  last_name: z.string()
    .min(1, errorMessages.required)
    .max(100, errorMessages.string_too_long(100)),

  birth_date: isoDateString
    .refine(notInFuture, errorMessages.date_in_future),

  death_date: isoDateString
    .refine(notInFuture, errorMessages.date_in_future),

  // Optional basic fields
  birth_place: z.string()
    .max(200, errorMessages.string_too_long(200))
    .optional()
    .or(z.literal('')),

  death_place: z.string()
    .max(200, errorMessages.string_too_long(200))
    .optional()
    .or(z.literal('')),

  // Optional additional fields
  gender: z.enum(['männlich', 'weiblich', 'divers', 'keine Angabe'])
    .optional()
    .or(z.literal('')),

  salutation: z.enum(['Herr', 'Frau', 'keine Angabe'])
    .optional()
    .or(z.literal('')),

  title: z.string()
    .max(50, errorMessages.string_too_long(50))
    .optional()
    .or(z.literal('')),

  second_name: z.string()
    .max(100, errorMessages.string_too_long(100))
    .optional()
    .or(z.literal('')),

  third_name: z.string()
    .max(100, errorMessages.string_too_long(100))
    .optional()
    .or(z.literal('')),

  birth_name: z.string()
    .max(100, errorMessages.string_too_long(100))
    .optional()
    .or(z.literal('')),

  name_suffix: z.string()
    .max(50, errorMessages.string_too_long(50))
    .optional()
    .or(z.literal('')),

  nickname: z.string()
    .max(50, errorMessages.string_too_long(50))
    .optional()
    .or(z.literal('')),

  // Relationship fields
  relationship_degree: z.string()
    .max(100, errorMessages.string_too_long(100))
    .optional()
    .or(z.literal('')),

  relationship_custom: z.string()
    .max(200, errorMessages.string_too_long(200))
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Validate death_date > birth_date (ISO format)
    const birthDate = new Date(data.birth_date);
    const deathDate = new Date(data.death_date);

    // Safety check: Validate both dates are valid
    if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) {
      return true; // Skip this validation if dates are invalid (handled by isoDateString)
    }

    return deathDate > birthDate;
  },
  {
    message: errorMessages.death_before_birth,
    path: ['death_date'],
  }
);

// ============================================================================
// PET-SPECIFIC SCHEMAS
// ============================================================================

export const petBasicInfoSchema = z.object({
  // Required fields
  first_name: z.string()
    .min(1, 'Name ist erforderlich')
    .max(100, errorMessages.string_too_long(100)),

  birth_date: isoDateString
    .refine(notInFuture, errorMessages.date_in_future),

  death_date: isoDateString
    .refine(notInFuture, errorMessages.date_in_future),

  // Optional fields
  birth_place: z.string()
    .max(200, errorMessages.string_too_long(200))
    .optional()
    .or(z.literal('')),

  death_place: z.string()
    .max(200, errorMessages.string_too_long(200))
    .optional()
    .or(z.literal('')),

  gender: z.enum(['männlich', 'weiblich'])
    .optional()
    .or(z.literal('')),

  nickname: z.string()
    .max(50, errorMessages.string_too_long(50))
    .optional()
    .or(z.literal('')),

  // Animal classification (numeric IDs from Tierarten/Rassengruppe/Rassen tables)
  animal_type_id: z.number().positive().optional(),
  breed_group_id: z.number().positive().optional(),
  breed_id: z.number().positive().optional(),
}).refine(
  (data) => {
    // Validate death_date > birth_date (ISO format)
    const birthDate = new Date(data.birth_date);
    const deathDate = new Date(data.death_date);

    // Safety check: Validate both dates are valid
    if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) {
      return true; // Skip this validation if dates are invalid (handled by isoDateString)
    }

    return deathDate > birthDate;
  },
  {
    message: errorMessages.death_before_birth,
    path: ['death_date'],
  }
);

// ============================================================================
// AVATAR SCHEMA
// ============================================================================

export const avatarSchema = z.object({
  avatar_type: z.enum(['initials', 'icon', 'image']),
  avatar_url: z.string().url().optional().or(z.literal('')),
  avatar_file: z.instanceof(File).optional(),
}).refine(
  (data) => {
    // If type is 'image', either URL or File must be present
    if (data.avatar_type === 'image') {
      return !!data.avatar_url || !!data.avatar_file;
    }
    return true;
  },
  {
    message: 'Bild ist erforderlich',
    path: ['avatar_file'],
  }
);

// ============================================================================
// PRIVACY SCHEMA
// ============================================================================

export const privacySchema = z.object({
  privacy_level: z.enum(['public', 'private']),
});

// ============================================================================
// COMBINED MEMORIAL CREATION SCHEMA
// ============================================================================

// Base schemas without refine (for composition)
const personBasicInfoBaseSchema = z.object({
  first_name: z.string().min(1, errorMessages.required).max(100, errorMessages.string_too_long(100)),
  last_name: z.string().min(1, errorMessages.required).max(100, errorMessages.string_too_long(100)),
  birth_date: isoDateString.refine(notInFuture, errorMessages.date_in_future),
  death_date: isoDateString.refine(notInFuture, errorMessages.date_in_future),
  birth_place: z.string().max(200, errorMessages.string_too_long(200)).optional().or(z.literal('')),
  death_place: z.string().max(200, errorMessages.string_too_long(200)).optional().or(z.literal('')),
  gender: z.enum(['männlich', 'weiblich', 'divers', 'keine Angabe']).optional().or(z.literal('')),
  salutation: z.enum(['Herr', 'Frau', 'keine Angabe']).optional().or(z.literal('')),
  title: z.string().max(50, errorMessages.string_too_long(50)).optional().or(z.literal('')),
  second_name: z.string().max(100, errorMessages.string_too_long(100)).optional().or(z.literal('')),
  third_name: z.string().max(100, errorMessages.string_too_long(100)).optional().or(z.literal('')),
  birth_name: z.string().max(100, errorMessages.string_too_long(100)).optional().or(z.literal('')),
  name_suffix: z.string().max(50, errorMessages.string_too_long(50)).optional().or(z.literal('')),
  nickname: z.string().max(50, errorMessages.string_too_long(50)).optional().or(z.literal('')),
});

const petBasicInfoBaseSchema = z.object({
  first_name: z.string().min(1, 'Name ist erforderlich').max(100, errorMessages.string_too_long(100)),
  birth_date: isoDateString.refine(notInFuture, errorMessages.date_in_future),
  death_date: isoDateString.refine(notInFuture, errorMessages.date_in_future),
  birth_place: z.string().max(200, errorMessages.string_too_long(200)).optional().or(z.literal('')),
  death_place: z.string().max(200, errorMessages.string_too_long(200)).optional().or(z.literal('')),
  gender: z.enum(['männlich', 'weiblich']).optional().or(z.literal('')),
  nickname: z.string().max(50, errorMessages.string_too_long(50)).optional().or(z.literal('')),
  animal_type_id: z.number().positive().optional(),
  breed_group_id: z.number().positive().optional(),
  breed_id: z.number().positive().optional(),
});

const avatarBaseSchema = z.object({
  avatar_type: z.enum(['initials', 'icon', 'image']),
  avatar_url: z.string().url().optional().or(z.literal('')),
  avatar_file: z.instanceof(File).optional(),
});

// Memorial creation schema (without discriminatedUnion due to .refine() compatibility issues)
export const memorialCreateSchema = z.union([
  // Person Memorial
  z.object({
    type: z.literal('person'),
    ...personBasicInfoBaseSchema.shape,
    ...avatarBaseSchema.shape,
    ...privacySchema.shape,
  }).refine(
    (data) => {
      // Validate death_date > birth_date (ISO format)
      const birthDate = new Date(data.birth_date);
      const deathDate = new Date(data.death_date);

      // Safety check: Validate both dates are valid
      if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) {
        return true;
      }

      return deathDate > birthDate;
    },
    { message: errorMessages.death_before_birth, path: ['death_date'] }
  ).refine(
    (data) => {
      if (data.avatar_type === 'image') {
        return !!data.avatar_url || !!data.avatar_file;
      }
      return true;
    },
    { message: 'Bild ist erforderlich', path: ['avatar_file'] }
  ),

  // Pet Memorial
  z.object({
    type: z.literal('pet'),
    ...petBasicInfoBaseSchema.shape,
    ...avatarBaseSchema.shape,
    ...privacySchema.shape,
  }).refine(
    (data) => {
      // Validate death_date > birth_date (ISO format)
      const birthDate = new Date(data.birth_date);
      const deathDate = new Date(data.death_date);

      // Safety check: Validate both dates are valid
      if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) {
        return true;
      }

      return deathDate > birthDate;
    },
    { message: errorMessages.death_before_birth, path: ['death_date'] }
  ).refine(
    (data) => {
      if (data.avatar_type === 'image') {
        return !!data.avatar_url || !!data.avatar_file;
      }
      return true;
    },
    { message: 'Bild ist erforderlich', path: ['avatar_file'] }
  ),
]);

// Type exports
export type PersonBasicInfo = z.infer<typeof personBasicInfoSchema>;
export type PetBasicInfo = z.infer<typeof petBasicInfoSchema>;
export type AvatarInfo = z.infer<typeof avatarSchema>;
export type PrivacyInfo = z.infer<typeof privacySchema>;
export type MemorialCreate = z.infer<typeof memorialCreateSchema>;
