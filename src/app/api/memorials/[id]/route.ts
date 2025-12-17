import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * PATCH /api/memorials/[id]
 *
 * Updates an existing memorial's basic information.
 * Requires authentication and ownership.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params;

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

    // 2. Verify memorial exists and user has permission
    const { data: memorial, error: fetchError } = await supabase
      .from('memorials')
      .select('id, creator_id, type, invite_link')
      .eq('id', memorialId)
      .single();

    if (fetchError || !memorial) {
      return NextResponse.json(
        { success: false, error: 'Gedenkseite nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (memorial.creator_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung zum Bearbeiten' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const payload = await request.json();

    // 4. Build update object (only allow specific fields)
    const updateData: Record<string, unknown> = {};

    // Common fields
    if (payload.first_name !== undefined) updateData.first_name = payload.first_name;
    if (payload.last_name !== undefined) updateData.last_name = payload.last_name || null;
    if (payload.birth_date !== undefined) updateData.birth_date = payload.birth_date;
    if (payload.death_date !== undefined) updateData.death_date = payload.death_date;
    if (payload.birth_place !== undefined) updateData.birth_place = payload.birth_place || null;
    if (payload.death_place !== undefined) updateData.death_place = payload.death_place || null;

    // Person-specific fields
    if (memorial.type === 'person') {
      if (payload.gender !== undefined) updateData.gender = payload.gender || null;
      if (payload.salutation !== undefined) updateData.salutation = payload.salutation || null;
      if (payload.title !== undefined) updateData.title = payload.title || null;
      if (payload.second_name !== undefined) updateData.second_name = payload.second_name || null;
      if (payload.third_name !== undefined) updateData.third_name = payload.third_name || null;
      if (payload.birth_name !== undefined) updateData.birth_name = payload.birth_name || null;
      if (payload.name_suffix !== undefined) updateData.name_suffix = payload.name_suffix || null;
      if (payload.nickname !== undefined) updateData.nickname = payload.nickname || null;
      if (payload.relationship_degree !== undefined) updateData.relationship_degree = payload.relationship_degree || null;
      if (payload.relationship_custom !== undefined) updateData.relationship_custom = payload.relationship_custom || null;
    }

    // Pet-specific fields
    if (memorial.type === 'pet') {
      if (payload.animal_type_id !== undefined) updateData.animal_type_id = payload.animal_type_id || null;
      if (payload.breed_group_id !== undefined) updateData.breed_group_id = payload.breed_group_id || null;
      if (payload.breed_id !== undefined) updateData.breed_id = payload.breed_id || null;
      if (payload.gender !== undefined) updateData.gender = payload.gender || null;
      if (payload.nickname !== undefined) updateData.nickname = payload.nickname || null;
    }

    // Avatar/Display fields (for both person and pet)
    if (payload.avatar_type !== undefined) updateData.avatar_type = payload.avatar_type || null;
    if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url || null;

    // Content fields (Spruch & Nachruf)
    if (payload.memorial_quote !== undefined) {
      // Validate max length for Spruch (160 characters)
      const quote = payload.memorial_quote || null;
      if (quote && quote.length > 160) {
        return NextResponse.json(
          { success: false, error: 'Der Spruch darf maximal 160 Zeichen lang sein' },
          { status: 400 }
        );
      }
      updateData.memorial_quote = quote;
    }
    if (payload.obituary !== undefined) {
      // Validate max length for Nachruf (5000 characters)
      const obituary = payload.obituary || null;
      if (obituary && obituary.length > 5000) {
        return NextResponse.json(
          { success: false, error: 'Der Nachruf darf maximal 5.000 Zeichen lang sein' },
          { status: 400 }
        );
      }
      updateData.obituary = obituary;
    }

    // Privacy/Settings fields
    if (payload.privacy_level !== undefined) {
      const privacyLevel = payload.privacy_level;
      // Validate privacy_level value
      if (privacyLevel !== 'public' && privacyLevel !== 'private') {
        return NextResponse.json(
          { success: false, error: 'Ungültiger Wert für Privatsphäre-Einstellung' },
          { status: 400 }
        );
      }
      updateData.privacy_level = privacyLevel;

      // Auto-generate invite_link when switching to private (if not exists)
      if (privacyLevel === 'private' && !memorial.invite_link) {
        updateData.invite_link = `/einladung/${crypto.randomUUID()}`;
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // 5. Update database
    const { error: updateError } = await supabase
      .from('memorials')
      .update(updateData)
      .eq('id', memorialId);

    if (updateError) {
      console.error('Memorial update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Aktualisieren der Gedenkseite' },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      memorial_id: memorialId,
      message: 'Gedenkseite erfolgreich aktualisiert'
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
 * DELETE /api/memorials/[id]
 *
 * Permanently deletes a memorial and all associated data.
 * Requires authentication, ownership, and name confirmation.
 *
 * Request body: { nameConfirmation: string }
 * The nameConfirmation must match "{first_name} {last_name}" exactly.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params;

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

    // 2. Verify memorial exists and user has permission
    const { data: memorial, error: fetchError } = await supabase
      .from('memorials')
      .select('id, creator_id, first_name, last_name, avatar_url')
      .eq('id', memorialId)
      .single();

    if (fetchError || !memorial) {
      return NextResponse.json(
        { success: false, error: 'Gedenkseite nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (memorial.creator_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung zum Löschen' },
        { status: 403 }
      );
    }

    // 3. Parse and validate name confirmation
    const payload = await request.json();
    const { nameConfirmation } = payload;

    if (!nameConfirmation) {
      return NextResponse.json(
        { success: false, error: 'Namensbestätigung erforderlich' },
        { status: 400 }
      );
    }

    // Build expected name (first_name + last_name if exists)
    const expectedName = `${memorial.first_name}${memorial.last_name ? ' ' + memorial.last_name : ''}`.trim();

    if (nameConfirmation !== expectedName) {
      return NextResponse.json(
        { success: false, error: 'Der eingegebene Name stimmt nicht überein' },
        { status: 400 }
      );
    }

    // 4. Delete storage files (memorial avatar)
    if (memorial.avatar_url) {
      try {
        // Extract filename from URL
        const url = new URL(memorial.avatar_url);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];

        if (fileName) {
          await supabase.storage
            .from('memorial-avatars')
            .remove([fileName]);
        }
      } catch (storageError) {
        // Log but don't fail - storage cleanup is non-critical
        console.error('Failed to delete avatar from storage:', storageError);
      }
    }

    // 5. Delete memorial (CASCADE will handle related data:
    //    - beitrag_posts
    //    - condolence_entries
    //    - memorial_invitations
    //    - memorial_reactions
    //    - post_reactions
    // )
    const { error: deleteError } = await supabase
      .from('memorials')
      .delete()
      .eq('id', memorialId);

    if (deleteError) {
      console.error('Memorial deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Löschen der Gedenkseite' },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      message: 'Gedenkseite erfolgreich gelöscht'
    });

  } catch (error) {
    console.error('Unexpected error during memorial deletion:', error);
    return NextResponse.json(
      { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
