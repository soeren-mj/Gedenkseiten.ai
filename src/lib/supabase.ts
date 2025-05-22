import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export type WaitlistEntry = {
  id: string;
  email: string;
  created_at: string;
  confirmed: boolean;
  confirmation_token: string;
  marketing_consent: boolean;
};

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: WaitlistEntry;
        Insert: Omit<WaitlistEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<WaitlistEntry, 'id' | 'created_at'>>;
      };
    };
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export class SupabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

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