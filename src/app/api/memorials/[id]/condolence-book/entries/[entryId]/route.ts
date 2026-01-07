import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const MAX_CONTENT_LENGTH = 2000;
const MAX_IMAGES = 12;

/**
 * GET /api/memorials/[id]/condolence-book/entries/[entryId]
 *
 * Fetches a single entry from the condolence book.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { entryId } = await params;

    // Create client with auth header if present
    const authHeader = request.headers.get('authorization');
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      authHeader
        ? {
            global: {
              headers: {
                Authorization: authHeader,
              },
            },
          }
        : undefined
    );

    const { data: entry, error } = await supabase
      .from('condolence_entries')
      .select(
        `
        *,
        user:users(id, name, avatar_url),
        images:condolence_entry_images(*)
      `
      )
      .eq('id', entryId)
      .single();

    if (error || !entry) {
      return NextResponse.json(
        { success: false, error: 'Eintrag nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
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
 * PATCH /api/memorials/[id]/condolence-book/entries/[entryId]
 *
 * Updates an entry in the condolence book.
 * Requires authentication. Only the entry owner can update.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { entryId } = await params;

    // 1. Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get user from token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // 2. Get the entry and verify ownership
    const { data: entry, error: entryError } = await supabase
      .from('condolence_entries')
      .select('id, user_id, book_id')
      .eq('id', entryId)
      .single();

    if (entryError || !entry) {
      return NextResponse.json(
        { success: false, error: 'Eintrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Only allow owner to update
    if (entry.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const payload = await request.json();
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Validate and add content if provided
    if (payload.content !== undefined) {
      if (
        typeof payload.content !== 'string' ||
        payload.content.trim().length === 0
      ) {
        return NextResponse.json(
          { success: false, error: 'Text ist erforderlich' },
          { status: 400 }
        );
      }

      if (payload.content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json(
          {
            success: false,
            error: `Text darf maximal ${MAX_CONTENT_LENGTH} Zeichen haben`,
          },
          { status: 400 }
        );
      }

      updateData.content = payload.content.trim();
    }

    // 4. Update entry
    const { data: updatedEntry, error: updateError } = await supabase
      .from('condolence_entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating entry:', updateError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Aktualisieren' },
        { status: 500 }
      );
    }

    // 5. Handle images if provided
    if (payload.images !== undefined) {
      const images = payload.images as string[];

      if (images.length > MAX_IMAGES) {
        return NextResponse.json(
          { success: false, error: `Maximal ${MAX_IMAGES} Bilder erlaubt` },
          { status: 400 }
        );
      }

      // Delete existing images
      await supabase
        .from('condolence_entry_images')
        .delete()
        .eq('entry_id', entryId);

      // Insert new images
      if (images.length > 0) {
        const imageInserts = images.map((imageUrl: string, index: number) => ({
          entry_id: entryId,
          image_url: imageUrl,
          sort_order: index,
        }));

        await supabase.from('condolence_entry_images').insert(imageInserts);
      }
    }

    // 6. Fetch the complete updated entry
    const { data: completeEntry } = await supabase
      .from('condolence_entries')
      .select(
        `
        *,
        user:users(id, name, avatar_url),
        images:condolence_entry_images(*)
      `
      )
      .eq('id', entryId)
      .single();

    return NextResponse.json({
      success: true,
      data: completeEntry || updatedEntry,
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
 * DELETE /api/memorials/[id]/condolence-book/entries/[entryId]
 *
 * Deletes an entry from the condolence book.
 * Requires authentication. Owner can delete own entry, admins can delete any.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { id: memorialId, entryId } = await params;

    // 1. Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get user from token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // 2. Get the entry
    const { data: entry, error: entryError } = await supabase
      .from('condolence_entries')
      .select('id, user_id, book_id')
      .eq('id', entryId)
      .single();

    if (entryError || !entry) {
      return NextResponse.json(
        { success: false, error: 'Eintrag nicht gefunden' },
        { status: 404 }
      );
    }

    // 3. Check permission: owner or admin
    const isOwner = entry.user_id === user.id;
    let isAdmin = false;

    if (!isOwner) {
      // Check if user is memorial creator or admin
      const { data: memorial } = await supabase
        .from('memorials')
        .select('creator_id')
        .eq('id', memorialId)
        .single();

      if (memorial?.creator_id === user.id) {
        isAdmin = true;
      } else {
        const { data: membership } = await supabase
          .from('memorial_members')
          .select('role')
          .eq('memorial_id', memorialId)
          .eq('user_id', user.id)
          .single();

        isAdmin = membership?.role === 'administrator';
      }
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // 4. Delete images first (cascade should handle this, but be explicit)
    await supabase
      .from('condolence_entry_images')
      .delete()
      .eq('entry_id', entryId);

    // 5. Delete the entry
    const { error: deleteError } = await supabase
      .from('condolence_entries')
      .delete()
      .eq('id', entryId);

    if (deleteError) {
      console.error('Error deleting entry:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Löschen' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Eintrag gelöscht',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
