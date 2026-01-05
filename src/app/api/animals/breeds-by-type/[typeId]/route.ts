import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/animals/breeds-by-type/[typeId]
 *
 * Fetches all breeds for a specific animal type (across all breed groups).
 * Used for parallel selection: user can choose breed directly without selecting breed group first.
 * Public endpoint - no authentication required.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ typeId: string }> }
) {
  try {
    const { typeId: typeIdStr } = await params;
    const typeId = parseInt(typeIdStr);

    if (isNaN(typeId)) {
      return NextResponse.json(
        { error: 'Ungültige Tierart-ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Join Rassen with Rassengruppe to filter by animal type
    const { data, error } = await supabase
      .from('Rassen')
      .select(`
        Rassen_ID,
        Rasse_Name,
        FK_Rassengruppe_ID,
        Rassengruppe!inner(FK_Tierart_ID)
      `)
      .eq('Rassengruppe.FK_Tierart_ID', typeId)
      .order('Rasse_Name', { ascending: true });

    if (error) {
      console.error('Error fetching breeds by type:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Rassen' },
        { status: 500 }
      );
    }

    console.log(`[breeds-by-type/${typeId}] Fetched ${data?.length || 0} breeds`);
    console.log('[breeds-by-type] First 10 breeds:', data?.slice(0, 10).map(b => b.Rasse_Name));

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
