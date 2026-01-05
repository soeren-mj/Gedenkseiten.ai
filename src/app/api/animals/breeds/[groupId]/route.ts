import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/animals/breeds/[groupId]
 *
 * Fetches breeds (Rassen) for a specific breed group.
 * Public endpoint - no authentication required.
 * Uses legacy client (not @supabase/ssr) since this is a public API without session needs.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId: groupIdStr } = await params;
    const groupId = parseInt(groupIdStr);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Ungültige Rassengruppen-ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Rassen')
      .select('Rassen_ID, Rasse_Name, FK_Rassengruppe_ID')
      .eq('FK_Rassengruppe_ID', groupId)
      .order('Rasse_Name', { ascending: true });

    if (error) {
      console.error('Error fetching breeds:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Rassen' },
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
