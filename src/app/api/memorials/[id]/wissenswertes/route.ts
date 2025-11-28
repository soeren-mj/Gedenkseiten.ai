import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const MAX_ENTRIES = 12;
const MAX_TEXT_LENGTH = 60;

/**
 * GET /api/memorials/[id]/wissenswertes
 *
 * Fetches all wissenswertes entries for a memorial, sorted by order_index.
 * Public memorials can be viewed by anyone, private only by creator.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params;

    // Create client (uses anon key, RLS will handle permissions)
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if user is authenticated (optional for GET)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      // Create authenticated client for RLS
      const authSupabase = createSupabaseClient<Database>(
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

      const { data, error } = await authSupabase
        .from('wissenswertes')
        .select('*')
        .eq('memorial_id', memorialId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching wissenswertes:', error);
        return NextResponse.json(
          { success: false, error: 'Fehler beim Laden' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || []
      });
    }

    // Unauthenticated access (only works for public memorials due to RLS)
    const { data, error } = await supabase
      .from('wissenswertes')
      .select('*')
      .eq('memorial_id', memorialId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching wissenswertes:', error);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Laden' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
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
 * POST /api/memorials/[id]/wissenswertes
 *
 * Creates a new wissenswertes entry.
 * Requires authentication and ownership.
 * Max 12 entries per memorial.
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

    // 3. Check entry limit
    const { count, error: countError } = await supabase
      .from('wissenswertes')
      .select('*', { count: 'exact', head: true })
      .eq('memorial_id', memorialId);

    if (countError) {
      console.error('Error counting entries:', countError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Prüfen der Einträge' },
        { status: 500 }
      );
    }

    if ((count || 0) >= MAX_ENTRIES) {
      return NextResponse.json(
        { success: false, error: `Maximal ${MAX_ENTRIES} Einträge erlaubt` },
        { status: 400 }
      );
    }

    // 4. Parse request body
    const payload = await request.json();
    const { emoji, text } = payload;

    // Validate text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
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

    // 5. Get next order_index
    const { data: lastEntry } = await supabase
      .from('wissenswertes')
      .select('order_index')
      .eq('memorial_id', memorialId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastEntry?.order_index ?? -1) + 1;

    // 6. Create entry
    const { data: newEntry, error: insertError } = await supabase
      .from('wissenswertes')
      .insert({
        memorial_id: memorialId,
        emoji: emoji || '⭐',
        text: text.trim(),
        order_index: nextOrderIndex,
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

    return NextResponse.json({
      success: true,
      data: newEntry
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
