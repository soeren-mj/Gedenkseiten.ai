import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const MAX_TEXT_LENGTH = 60;

/**
 * Helper: Verify user is authenticated and is the memorial creator
 */
async function verifyOwnership(
  request: Request,
  memorialId: string
): Promise<{ success: false; response: NextResponse } | { success: true; supabase: ReturnType<typeof createSupabaseClient<Database>>; userId: string }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    };
  }

  const token = authHeader.replace('Bearer ', '');

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

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    };
  }

  // Verify memorial ownership
  const { data: memorial, error: fetchError } = await supabase
    .from('memorials')
    .select('id, creator_id')
    .eq('id', memorialId)
    .single();

  if (fetchError || !memorial) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Gedenkseite nicht gefunden' },
        { status: 404 }
      )
    };
  }

  if (memorial.creator_id !== user.id) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Keine Berechtigung' },
        { status: 403 }
      )
    };
  }

  return { success: true, supabase, userId: user.id };
}

/**
 * PATCH /api/memorials/[id]/wissenswertes/[wissenswertesId]
 *
 * Updates an existing wissenswertes entry.
 * Requires authentication and ownership.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; wissenswertesId: string }> }
) {
  try {
    const { id: memorialId, wissenswertesId } = await params;

    // Verify ownership
    const authResult = await verifyOwnership(request, memorialId);
    if (!authResult.success) {
      return authResult.response;
    }

    const { supabase } = authResult;

    // Parse request body
    const payload = await request.json();
    const updateData: Record<string, unknown> = {};

    // Validate and add emoji
    if (payload.emoji !== undefined) {
      updateData.emoji = payload.emoji || '⭐';
    }

    // Validate and add text
    if (payload.text !== undefined) {
      const text = payload.text;
      if (typeof text !== 'string' || text.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Text ist erforderlich' },
          { status: 400 }
        );
      }
      if (text.length > MAX_TEXT_LENGTH) {
        return NextResponse.json(
          { success: false, error: `Text darf maximal ${MAX_TEXT_LENGTH} Zeichen haben` },
          { status: 400 }
        );
      }
      updateData.text = text.trim();
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update entry
    const { data: updatedEntry, error: updateError } = await supabase
      .from('wissenswertes')
      .update(updateData)
      .eq('id', wissenswertesId)
      .eq('memorial_id', memorialId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating entry:', updateError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Aktualisieren' },
        { status: 500 }
      );
    }

    if (!updatedEntry) {
      return NextResponse.json(
        { success: false, error: 'Eintrag nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEntry
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/memorials/[id]/wissenswertes/[wissenswertesId]
 *
 * Deletes a wissenswertes entry.
 * Requires authentication and ownership.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; wissenswertesId: string }> }
) {
  try {
    const { id: memorialId, wissenswertesId } = await params;

    // Verify ownership
    const authResult = await verifyOwnership(request, memorialId);
    if (!authResult.success) {
      return authResult.response;
    }

    const { supabase } = authResult;

    // Delete entry
    const { error: deleteError } = await supabase
      .from('wissenswertes')
      .delete()
      .eq('id', wissenswertesId)
      .eq('memorial_id', memorialId);

    if (deleteError) {
      console.error('Error deleting entry:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Löschen' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Eintrag gelöscht'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
