import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const MAX_CONTENT_LENGTH = 2000;
const MAX_IMAGES = 12;

/**
 * GET /api/memorials/[id]/condolence-book/entries
 *
 * Fetches all entries for a condolence book.
 * Returns entries with user data and images.
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

    // First get the condolence book
    const { data: book, error: bookError } = await supabase
      .from('condolence_books')
      .select('id')
      .eq('memorial_id', memorialId)
      .single();

    if (bookError || !book) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Fetch entries with user data and images
    const { data: entries, error } = await supabase
      .from('condolence_entries')
      .select(
        `
        *,
        user:users(id, name, avatar_url),
        images:condolence_entry_images(*)
      `
      )
      .eq('book_id', book.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Laden' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entries || [],
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
 * POST /api/memorials/[id]/condolence-book/entries
 *
 * Creates a new entry in the condolence book.
 * Requires authentication. Each user can only have one entry per book.
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

    // 2. Get the condolence book
    const { data: book, error: bookError } = await supabase
      .from('condolence_books')
      .select('id')
      .eq('memorial_id', memorialId)
      .single();

    if (bookError || !book) {
      return NextResponse.json(
        { success: false, error: 'Kondolenzbuch nicht gefunden' },
        { status: 404 }
      );
    }

    // 3. Check if user already has an entry
    const { data: existingEntry } = await supabase
      .from('condolence_entries')
      .select('id')
      .eq('book_id', book.id)
      .eq('user_id', user.id)
      .single();

    if (existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Du hast bereits einen Eintrag in diesem Kondolenzbuch. Du kannst deinen bestehenden Eintrag bearbeiten.',
        },
        { status: 409 }
      );
    }

    // 4. Parse request body
    const payload = await request.json();
    const { content, images = [] } = payload;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Text ist erforderlich' },
        { status: 400 }
      );
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Text darf maximal ${MAX_CONTENT_LENGTH} Zeichen haben`,
        },
        { status: 400 }
      );
    }

    // Validate images
    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        { success: false, error: `Maximal ${MAX_IMAGES} Bilder erlaubt` },
        { status: 400 }
      );
    }

    // 5. Create entry
    const { data: newEntry, error: insertError } = await supabase
      .from('condolence_entries')
      .insert({
        book_id: book.id,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating entry:', insertError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Erstellen' },
        { status: 500 }
      );
    }

    // 6. Add images if provided
    if (images.length > 0) {
      const imageInserts = images.map(
        (imageUrl: string, index: number) => ({
          entry_id: newEntry.id,
          image_url: imageUrl,
          sort_order: index,
        })
      );

      const { error: imagesError } = await supabase
        .from('condolence_entry_images')
        .insert(imageInserts);

      if (imagesError) {
        console.error('Error adding images:', imagesError);
        // Don't fail the whole request, entry was created
      }
    }

    // 7. Fetch the complete entry with images
    const { data: completeEntry, error: fetchError } = await supabase
      .from('condolence_entries')
      .select(
        `
        *,
        user:users(id, name, avatar_url),
        images:condolence_entry_images(*)
      `
      )
      .eq('id', newEntry.id)
      .single();

    if (fetchError) {
      // Return basic entry if fetch fails
      return NextResponse.json(
        {
          success: true,
          data: newEntry,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: completeEntry,
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
