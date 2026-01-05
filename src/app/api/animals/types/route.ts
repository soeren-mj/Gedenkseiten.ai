import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/animals/types
 *
 * Fetches all animal types (Tierarten) for pet memorial creation.
 * Public endpoint - no authentication required.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('Tierarten')
      .select('Tierart_ID, Tierart_Name')
      .order('Tierart_ID', { ascending: true });

    if (error) {
      console.error('Error fetching animal types:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Tierarten' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: data || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
