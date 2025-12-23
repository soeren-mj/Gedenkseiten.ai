import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * POST /api/memorials/[id]/condolence-book/entries/mark-read
 *
 * Marks all entries as read by admin.
 * Requires authentication and admin/creator access.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params;

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

    // 2. Verify user has admin access to memorial
    const { data: memorial } = await supabase
      .from('memorials')
      .select('creator_id')
      .eq('id', memorialId)
      .single();

    const isCreator = memorial?.creator_id === user.id;
    let isAdmin = false;

    if (!isCreator) {
      const { data: membership } = await supabase
        .from('memorial_members')
        .select('role')
        .eq('memorial_id', memorialId)
        .eq('user_id', user.id)
        .single();

      isAdmin = membership?.role === 'administrator';
    }

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // 3. Get the condolence book
    const { data: book } = await supabase
      .from('condolence_books')
      .select('id')
      .eq('memorial_id', memorialId)
      .single();

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Kondolenzbuch nicht gefunden' },
        { status: 404 }
      );
    }

    // 4. Parse request body for optional entryIds
    let entryIds: string[] | undefined;
    try {
      const payload = await request.json();
      entryIds = payload.entryIds;
    } catch {
      // No body or invalid JSON - mark all as read
    }

    // 5. Mark entries as read
    let query = supabase
      .from('condolence_entries')
      .update({ is_read_by_admin: true })
      .eq('book_id', book.id)
      .eq('is_read_by_admin', false);

    if (entryIds && entryIds.length > 0) {
      query = query.in('id', entryIds);
    }

    const { error: updateError, count } = await query.select('id');

    if (updateError) {
      console.error('Error marking entries as read:', updateError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Aktualisieren' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Einträge als gelesen markiert',
      markedCount: count || 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
