import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * POST /api/memorials/[id]/wissenswertes/reorder
 *
 * Updates the order_index of all wissenswertes entries based on the provided order.
 * Requires authentication and ownership.
 *
 * Body: { orderedIds: string[] }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params;

    // 1. Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create client with user's session token
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // 2. Verify memorial exists and user is the creator
    const { data: memorial, error: fetchError } = await supabase
      .from('memorials')
      .select('id, creator_id')
      .eq('id', memorialId)
      .single();

    if (fetchError || !memorial) {
      return NextResponse.json(
        { success: false, error: 'Gedenkseite nicht gefunden' },
        { status: 404 }
      );
    }

    if (memorial.creator_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const payload = await request.json();
    const { orderedIds } = payload;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: 'orderedIds muss ein Array sein' },
        { status: 400 }
      );
    }

    // 4. Update order_index for each entry
    const updatePromises = orderedIds.map((id: string, index: number) =>
      supabase
        .from('wissenswertes')
        .update({
          order_index: index,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('memorial_id', memorialId)
    );

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Errors updating order:', errors.map(e => e.error));
      return NextResponse.json(
        { success: false, error: 'Fehler beim Aktualisieren der Reihenfolge' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reihenfolge aktualisiert'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
