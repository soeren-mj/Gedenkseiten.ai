import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * POST /api/memorials
 *
 * Creates a new memorial with all wizard data.
 * Requires authentication.
 */
export async function POST(request: Request) {
  try {
    // 1. Get auth token from request headers
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert - Kein Auth Header' },
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
        { success: false, error: 'Nicht authentifiziert - Ungültiger Token' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const payload = await request.json();

    // 3. Validate required fields
    if (!payload.type || !payload.first_name || !payload.birth_date || !payload.death_date) {
      return NextResponse.json(
        { success: false, error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    // Validate type
    if (payload.type !== 'person' && payload.type !== 'tier') {
      return NextResponse.json(
        { success: false, error: 'Ungültiger Typ' },
        { status: 400 }
      );
    }

    // Convert 'tier' to 'pet' for database (DB constraint uses 'pet')
    const dbType = payload.type === 'tier' ? 'pet' : payload.type;

    // 4. Build database insert object
    const memorialData = {
      creator_id: user.id,
      type: dbType as 'person' | 'pet',
      first_name: payload.first_name,
      last_name: payload.last_name || null,
      birth_date: payload.birth_date,
      death_date: payload.death_date,
      birth_place: payload.birth_place || null,
      death_place: payload.death_place || null,
      avatar_type: (payload.avatar_type || 'initials') as 'initials' | 'image' | 'icon',
      avatar_url: payload.avatar_url || null,
      privacy_level: (payload.privacy_level || 'public') as 'public' | 'private',
      is_active: true,
    } as Record<string, unknown>;

    // Add person-specific fields
    if (payload.type === 'person') {
      memorialData.gender = payload.gender || null;
      memorialData.salutation = payload.salutation || null;
      memorialData.title = payload.title || null;
      memorialData.second_name = payload.second_name || null;
      memorialData.third_name = payload.third_name || null;
      memorialData.birth_name = payload.birth_name || null;
      memorialData.name_suffix = payload.name_suffix || null;
      memorialData.nickname = payload.nickname || null;
      memorialData.relationship_degree = payload.relationship_degree || null;
      memorialData.relationship_custom = payload.relationship_custom || null;
    }

    // Add pet-specific fields
    if (payload.type === 'tier') {
      memorialData.animal_type_id = payload.animal_type_id || null;
      memorialData.breed_group_id = payload.breed_group_id || null;
      memorialData.breed_id = payload.breed_id || null;
      memorialData.gender = payload.gender || null;
      memorialData.nickname = payload.nickname || null;
    }

    // 5. Insert into database
    const { data, error } = await supabase
      .from('memorials')
      .insert(memorialData)
      .select('id')
      .single();

    if (error) {
      console.error('Memorial creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Erstellen der Gedenkseite' },
        { status: 500 }
      );
    }

    // 6. Generate invite link for private memorials
    if (payload.privacy_level === 'private') {
      const inviteToken = crypto.randomUUID();
      const inviteLink = `/einladung/${inviteToken}`;

      await supabase
        .from('memorials')
        .update({ invite_link: inviteLink })
        .eq('id', data.id);
    }

    // 7. Return success with redirect URL
    return NextResponse.json({
      success: true,
      memorial_id: data.id,
      redirect_url: `/gedenkseite/${data.id}/verwalten`,
      message: 'Gedenkseite erfolgreich erstellt'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
