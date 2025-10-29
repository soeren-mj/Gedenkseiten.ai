import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ============================================================================
// DATABASE TYPE DEFINITIONS
// ============================================================================

// Enums
export type MemorialType = 'person' | 'pet';
export type PrivacyLevel = 'public' | 'private';
export type UserRole = 'member' | 'administrator';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';
export type ReactionType = 'heart' | 'candle' | 'flower' | 'dove' | 'prayer';
export type EventType = 'burial' | 'memorial_service' | 'cremation' | 'sea_burial' | 'funeral' | 'remembrance_ceremony' | 'other';

// Core table types
export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  theme_preference: 'light' | 'dark' | 'system';
  notification_preferences: {
    memorial_activity: boolean;
    moderation_required: boolean;
    reminders: boolean;
    new_features: boolean;
  };
  created_at: string;
  updated_at: string;
};

export type Memorial = {
  id: string;
  creator_id: string;
  type: MemorialType;
  
  // Basic information
  first_name: string;
  last_name: string | null;
  birth_name: string | null;
  nickname: string | null;
  
  // Dates and locations
  birth_date: string;
  death_date: string;
  birth_place: string | null;
  death_place: string | null;
  
  // Pet-specific fields
  animal_type: string | null;
  breed_group: string | null;
  breed: string | null;
  
  // Display
  avatar_type: 'initials' | 'icon' | 'image';
  avatar_url: string | null;
  memorial_quote: string | null;
  obituary: string | null;
  
  // Privacy and access
  privacy_level: PrivacyLevel;
  invite_link: string | null;
  
  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MemorialInvitation = {
  id: string;
  memorial_id: string;
  invited_email: string;
  invited_by: string;
  role: UserRole;
  status: InvitationStatus;
  accepted_at: string | null;
  created_at: string;
};

export type CondolenceBook = {
  id: string;
  memorial_id: string;
  cover_background_type: 'color' | 'image';
  cover_background_value: string;
  cover_text: string;
  show_profile: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CondolenceEntry = {
  id: string;
  condolence_book_id: string;
  memorial_id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  message: string;
  images: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type BeitragPost = {
  id: string;
  memorial_id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  headline_icon: ReactionType | null;
  headline_text: string | null;
  content_text: string | null;
  content_rich_text: Record<string, unknown> | null; // JSONB for rich text formatting
  image_urls: string[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type MemorialReaction = {
  id: string;
  memorial_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
};

export type PostReaction = {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
};

export type MemorialEvent = {
  id: string;
  memorial_id: string;
  event_type: EventType;
  title: string;
  location: string | null;
  location_details: Record<string, unknown> | null; // JSONB for maps data
  start_date: string;
  end_date: string | null;
  is_all_day: boolean;
  funeral_director: string | null;
  burial_type: string | null;
  is_system_generated: boolean;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  memorial_id: string;
  icon: string;
  text: string;
  order_index: number;
  created_at: string;
};

export type Memory = {
  id: string;
  memorial_id: string;
  title: string;
  cover_image_url: string | null;
  image_urls: string[];
  captions: { [key: string]: string } | null; // JSONB for image captions
  duration_per_slide: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Waitlist (existing)
export type WaitlistEntry = {
  id: string;
  email: string;
  created_at: string;
  confirmed: boolean;
  confirmation_token: string;
  marketing_consent: boolean;
};

// Registration status type
export type RegistrationStatus = 'pending' | 'confirmed' | 'confirmed_with_email' | 'confirmed_without_email' | 'email_failed';

// Registrations (waitlist with DOI confirmation)
export type Registration = {
  id: string;
  name: string;
  email: string;
  status: RegistrationStatus;
  confirmation_token: string;
  confirmed_at: string | null;
  token_expires_at: string;
  email_error: string | null;
  created_at: string;
  updated_at: string;
};

// Database schema type
export type Database = {
  public: {
    Tables: {
      // Auth users (Supabase managed)
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      
      // Memorials
      memorials: {
        Row: Memorial;
        Insert: Omit<Memorial, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Memorial, 'id' | 'creator_id' | 'created_at'>>;
      };
      
      // Memorial invitations
      memorial_invitations: {
        Row: MemorialInvitation;
        Insert: Omit<MemorialInvitation, 'id' | 'created_at'>;
        Update: Partial<Omit<MemorialInvitation, 'id' | 'memorial_id' | 'created_at'>>;
      };
      
      // Condolence books
      condolence_books: {
        Row: CondolenceBook;
        Insert: Omit<CondolenceBook, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CondolenceBook, 'id' | 'memorial_id' | 'created_at'>>;
      };
      
      // Condolence entries
      condolence_entries: {
        Row: CondolenceEntry;
        Insert: Omit<CondolenceEntry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CondolenceEntry, 'id' | 'created_at'>>;
      };
      
      // Beitrag posts
      beitrag_posts: {
        Row: BeitragPost;
        Insert: Omit<BeitragPost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BeitragPost, 'id' | 'created_at'>>;
      };
      
      // Memorial reactions
      memorial_reactions: {
        Row: MemorialReaction;
        Insert: Omit<MemorialReaction, 'id' | 'created_at'>;
        Update: Partial<Omit<MemorialReaction, 'id' | 'created_at'>>;
      };
      
      // Post reactions
      post_reactions: {
        Row: PostReaction;
        Insert: Omit<PostReaction, 'id' | 'created_at'>;
        Update: Partial<Omit<PostReaction, 'id' | 'created_at'>>;
      };
      
      // Memorial events
      memorial_events: {
        Row: MemorialEvent;
        Insert: Omit<MemorialEvent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MemorialEvent, 'id' | 'created_at'>>;
      };
      
      // Achievements
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id' | 'created_at'>;
        Update: Partial<Omit<Achievement, 'id' | 'created_at'>>;
      };
      
      // Memories (Premium feature)
      memories: {
        Row: Memory;
        Insert: Omit<Memory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Memory, 'id' | 'created_at'>>;
      };
      
      // Waitlist (existing)
      waitlist: {
        Row: WaitlistEntry;
        Insert: Omit<WaitlistEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<WaitlistEntry, 'id' | 'created_at'>>;
      };

      // Registrations (waitlist with DOI confirmation)
      registrations: {
        Row: Registration;
        Insert: Omit<Registration, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Registration, 'id' | 'created_at'>>;
      };
    };
  };
};

// ============================================================================
// CLIENT CONFIGURATIONS
// ============================================================================

// 1. Client Component Client (for use in React components)
export const createClientSupabase = () => {
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
};

// 2. Server Component Client (for use in server components and API routes)
export const createServerSupabase = async () => {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// 3. Service Role Client (for admin operations, if needed)
export const createServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return createClient<Database>(supabaseUrl, serviceKey);
};

// Legacy client for backward compatibility (waitlist functionality)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// ============================================================================
// HELPER FUNCTIONS AND ERROR HANDLING
// ============================================================================

export class SupabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Existing waitlist functions (preserved for backward compatibility)
export async function addToWaitlist(email: string, marketingConsent: boolean): Promise<WaitlistEntry> {
  try {
    const confirmationToken = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          email,
          marketing_consent: marketingConsent,
          confirmation_token: confirmationToken,
          confirmed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new SupabaseError('Diese E-Mail-Adresse ist bereits registriert.', 'DUPLICATE_EMAIL');
      }
      throw new SupabaseError(error.message, error.code);
    }

    if (!data) {
      throw new SupabaseError('Fehler beim Speichern der Daten.');
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError('Ein unerwarteter Fehler ist aufgetreten.');
  }
}

export async function confirmWaitlist(token: string): Promise<WaitlistEntry> {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .update({ confirmed: true })
      .eq('confirmation_token', token)
      .select()
      .single();

    if (error) {
      throw new SupabaseError(error.message, error.code);
    }

    if (!data) {
      throw new SupabaseError('Ungültiger oder abgelaufener Bestätigungslink.');
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError('Ein unerwarteter Fehler ist aufgetreten.');
  }
}

// ============================================================================
// MEMORIAL HELPER FUNCTIONS
// ============================================================================

/**
 * Get a memorial by ID with proper type safety
 */
export async function getMemorial(id: string, client = supabase): Promise<Memorial | null> {
  const { data, error } = await client
    .from('memorials')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Search memorials with privacy considerations
 */
export async function searchMemorials(
  query: string, 
  limit = 10,
  client = supabase
): Promise<Memorial[]> {
  const { data, error } = await client
    .from('memorials')
    .select('id, first_name, last_name, avatar_url, privacy_level, birth_date, death_date')
    .or(`first_name.ilike.%${query}%, last_name.ilike.%${query}%, birth_name.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(limit);

  if (error || !data) return [];
  return data as Memorial[];
}

/**
 * Get memorial reactions count
 */
export async function getMemorialReactions(
  memorialId: string,
  client = supabase
): Promise<{ [key in ReactionType]: number }> {
  const { data, error } = await client
    .from('memorial_reactions')
    .select('reaction_type')
    .eq('memorial_id', memorialId);

  if (error || !data) {
    return { heart: 0, candle: 0, flower: 0, dove: 0, prayer: 0 };
  }

  const counts = data.reduce((acc, reaction) => {
    acc[reaction.reaction_type as ReactionType] = (acc[reaction.reaction_type as ReactionType] || 0) + 1;
    return acc;
  }, {} as { [key in ReactionType]: number });

  return {
    heart: counts.heart || 0,
    candle: counts.candle || 0,
    flower: counts.flower || 0,
    dove: counts.dove || 0,
    prayer: counts.prayer || 0,
  };
}

/**
 * Toggle memorial reaction
 */
export async function toggleMemorialReaction(
  memorialId: string,
  userId: string,
  reactionType: ReactionType,
  client = supabase
): Promise<boolean> {
  // Check if reaction exists
  const { data: existing } = await client
    .from('memorial_reactions')
    .select('id')
    .eq('memorial_id', memorialId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
    .single();

  if (existing) {
    // Remove reaction
    const { error } = await client
      .from('memorial_reactions')
      .delete()
      .eq('id', existing.id);
    return !error;
  } else {
    // Add reaction
    const { error } = await client
      .from('memorial_reactions')
      .insert({
        memorial_id: memorialId,
        user_id: userId,
        reaction_type: reactionType,
      });
    return !error;
  }
}