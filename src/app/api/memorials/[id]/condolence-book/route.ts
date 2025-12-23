import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * GET /api/memorials/[id]/condolence-book
 *
 * Fetches the condolence book for a memorial with entry count.
 * Public memorials can be viewed by anyone, private only by authorized users.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params;

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

    // Fetch condolence book for this memorial
    const { data: book, error } = await supabase
      .from('condolence_books')
      .select('*')
      .eq('memorial_id', memorialId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected for non-existing book)
      console.error('Error fetching condolence book:', error);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Laden' },
        { status: 500 }
      );
    }

    if (!book) {
      return NextResponse.json({
        success: true,
        data: null,
        entriesCount: 0,
        newEntriesCount: 0,
      });
    }

    // Get entry counts
    const { count: totalCount } = await supabase
      .from('condolence_entries')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', book.id);

    const { count: newCount } = await supabase
      .from('condolence_entries')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', book.id)
      .eq('is_read_by_admin', false);

    return NextResponse.json({
      success: true,
      data: book,
      entriesCount: totalCount || 0,
      newEntriesCount: newCount || 0,
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
 * POST /api/memorials/[id]/condolence-book
 *
 * Creates a new condolence book for a memorial.
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

    // 2. Verify memorial exists and user has admin access
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

    // Check if user is creator or admin
    const isCreator = memorial.creator_id === user.id;
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

    // 3. Check if condolence book already exists
    const { data: existingBook } = await supabase
      .from('condolence_books')
      .select('id')
      .eq('memorial_id', memorialId)
      .single();

    if (existingBook) {
      return NextResponse.json(
        { success: false, error: 'Kondolenzbuch existiert bereits' },
        { status: 409 }
      );
    }

    // 4. Parse request body
    const payload = await request.json();
    const {
      cover_type,
      cover_value,
      cover_title,
      text_color = 'white',
      show_profile = false,
    } = payload;

    // Validate required fields
    if (!cover_type || !cover_value || !cover_title) {
      return NextResponse.json(
        { success: false, error: 'Alle Pflichtfelder müssen ausgefüllt sein' },
        { status: 400 }
      );
    }

    // Validate cover_type
    if (!['color', 'preset', 'custom'].includes(cover_type)) {
      return NextResponse.json(
        { success: false, error: 'Ungültiger Cover-Typ' },
        { status: 400 }
      );
    }

    // 5. Create condolence book
    const { data: newBook, error: insertError } = await supabase
      .from('condolence_books')
      .insert({
        memorial_id: memorialId,
        cover_type,
        cover_value,
        cover_title: cover_title.trim(),
        text_color,
        show_profile,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating condolence book:', insertError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Erstellen' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newBook,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/memorials/[id]/condolence-book
 *
 * Updates the condolence book cover settings.
 * Requires authentication and admin/creator access.
 */
export async function PATCH(
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

    // 2. Verify memorial exists and user has admin access
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

    // Check if user is creator or admin
    const isCreator = memorial.creator_id === user.id;
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

    // 3. Check if condolence book exists
    const { data: existingBook, error: bookError } = await supabase
      .from('condolence_books')
      .select('id')
      .eq('memorial_id', memorialId)
      .single();

    if (bookError || !existingBook) {
      return NextResponse.json(
        { success: false, error: 'Kondolenzbuch nicht gefunden' },
        { status: 404 }
      );
    }

    // 4. Parse request body and build update object
    const payload = await request.json();
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are present in payload
    if (payload.cover_type !== undefined) {
      if (!['color', 'preset', 'custom'].includes(payload.cover_type)) {
        return NextResponse.json(
          { success: false, error: 'Ungültiger Cover-Typ' },
          { status: 400 }
        );
      }
      updateData.cover_type = payload.cover_type;
    }

    if (payload.cover_value !== undefined) {
      updateData.cover_value = payload.cover_value;
    }

    if (payload.cover_title !== undefined) {
      updateData.cover_title = payload.cover_title.trim();
    }

    if (payload.text_color !== undefined) {
      if (!['white', 'black'].includes(payload.text_color)) {
        return NextResponse.json(
          { success: false, error: 'Ungültige Textfarbe' },
          { status: 400 }
        );
      }
      updateData.text_color = payload.text_color;
    }

    if (payload.show_profile !== undefined) {
      updateData.show_profile = payload.show_profile;
    }

    // 5. Update condolence book
    const { data: updatedBook, error: updateError } = await supabase
      .from('condolence_books')
      .update(updateData)
      .eq('id', existingBook.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating condolence book:', updateError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Aktualisieren' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBook,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
