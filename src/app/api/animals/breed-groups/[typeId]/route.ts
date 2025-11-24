import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/animals/breed-groups/[typeId]
 *
 * Fetches breed groups (Rassengruppe) for a specific animal type.
 * Public endpoint - no authentication required.
 */
export async function GET(
  request: Request,
  { params }: { params: { typeId: string } }
) {
  try {
    const typeId = parseInt(params.typeId);

    if (isNaN(typeId)) {
      return NextResponse.json(
        { error: 'Ungültige Tierart-ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('Rassengruppe')
      .select('Rassengruppe_ID, Rassengruppe_Name, FK_Tierart_ID')
      .eq('FK_Tierart_ID', typeId)
      .order('Rassengruppe_Name', { ascending: true });

    if (error) {
      console.error('Error fetching breed groups:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Rassengruppen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
