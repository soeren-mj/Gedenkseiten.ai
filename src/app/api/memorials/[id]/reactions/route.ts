import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database, ReactionType } from '@/lib/supabase';
import { createServiceSupabase } from '@/lib/supabase';

const REACTION_TYPES: ReactionType[] = ['liebe', 'dankbarkeit', 'freiheit', 'blumen', 'kerze'];

type ReactionCounts = { [key in ReactionType]: number };

/**
 * GET /api/memorials/[id]/reactions
 *
 * Fetches reaction counts for a memorial and the current user's reactions.
 * Public memorials can be viewed by anyone, private only by creator.
 *
 * Response:
 * {
 *   success: boolean;
 *   data: {
 *     counts: { liebe: number, dankbarkeit: number, freiheit: number, blumen: number, kerze: number };
 *     userReactions: ReactionType[]; // Empty array if not authenticated
 *   }
 * }
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params;

    // Check if user is authenticated
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Create client (uses anon key or with auth token)
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      token ? {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      } : undefined
    );

    // Get user if authenticated
    let userId: string | null = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Fetch all reactions for this memorial
    const { data: reactions, error } = await supabase
      .from('memorial_reactions')
      .select('reaction_type, user_id')
      .eq('memorial_id', memorialId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Laden der Reaktionen' },
        { status: 500 }
      );
    }

    // Calculate counts
    const counts: ReactionCounts = {
      liebe: 0,
      dankbarkeit: 0,
      freiheit: 0,
      blumen: 0,
      kerze: 0
    };

    const userReactions: ReactionType[] = [];

    (reactions || []).forEach((reaction) => {
      const type = reaction.reaction_type as ReactionType;
      if (REACTION_TYPES.includes(type)) {
        counts[type]++;
        if (userId && reaction.user_id === userId) {
          userReactions.push(type);
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        counts,
        userReactions
      }
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
 * POST /api/memorials/[id]/reactions
 *
 * Toggles a reaction for the current user (add if not exists, remove if exists).
 * Requires authentication.
 * Creates a notification for the memorial creator.
 *
 * Request Body:
 * { reactionType: ReactionType }
 *
 * Response:
 * {
 *   success: boolean;
 *   action: 'added' | 'removed';
 *   data: {
 *     counts: ReactionCounts;
 *     userReactions: ReactionType[];
 *   }
 * }
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

    // 2. Parse request body
    const payload = await request.json();
    const { reactionType } = payload;

    // Validate reaction type
    if (!reactionType || !REACTION_TYPES.includes(reactionType)) {
      return NextResponse.json(
        { success: false, error: 'Ungültiger Reaktionstyp' },
        { status: 400 }
      );
    }

    // 3. Verify memorial exists and get creator_id
    const { data: memorial, error: memorialError } = await supabase
      .from('memorials')
      .select('id, creator_id')
      .eq('id', memorialId)
      .single();

    if (memorialError || !memorial) {
      return NextResponse.json(
        { success: false, error: 'Gedenkseite nicht gefunden' },
        { status: 404 }
      );
    }

    // 4. Check if reaction already exists
    const { data: existingReaction } = await supabase
      .from('memorial_reactions')
      .select('id')
      .eq('memorial_id', memorialId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .single();

    let action: 'added' | 'removed';

    if (existingReaction) {
      // Remove reaction
      const { error: deleteError } = await supabase
        .from('memorial_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error('Error removing reaction:', deleteError);
        return NextResponse.json(
          { success: false, error: 'Fehler beim Entfernen der Reaktion' },
          { status: 500 }
        );
      }
      action = 'removed';
    } else {
      // Add reaction
      const { error: insertError } = await supabase
        .from('memorial_reactions')
        .insert({
          memorial_id: memorialId,
          user_id: user.id,
          reaction_type: reactionType,
        });

      if (insertError) {
        console.error('Error adding reaction:', insertError);
        return NextResponse.json(
          { success: false, error: 'Fehler beim Hinzufügen der Reaktion' },
          { status: 500 }
        );
      }
      action = 'added';

      // 5. Create notification for memorial creator (only when adding, not removing)
      // Don't notify if user is reacting to their own memorial
      if (memorial.creator_id !== user.id) {
        // Get user profile from users table for accurate name/avatar
        const { data: userProfile } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single();

        // Fallback chain: users table -> user_metadata -> email prefix -> 'Besucher'
        const actorName = userProfile?.name
          || user.user_metadata?.full_name
          || user.user_metadata?.name
          || user.email?.split('@')[0]
          || 'Besucher';
        const actorAvatarUrl = userProfile?.avatar_url
          || user.user_metadata?.avatar_url
          || null;

        await createOrUpdateNotification(
          memorial.creator_id,
          memorialId,
          user.id,
          actorName,
          actorAvatarUrl,
          reactionType
        );
      }
    }

    // 6. Fetch updated counts
    const { data: reactions } = await supabase
      .from('memorial_reactions')
      .select('reaction_type, user_id')
      .eq('memorial_id', memorialId);

    const counts: ReactionCounts = {
      liebe: 0,
      dankbarkeit: 0,
      freiheit: 0,
      blumen: 0,
      kerze: 0
    };

    const userReactions: ReactionType[] = [];

    (reactions || []).forEach((reaction) => {
      const type = reaction.reaction_type as ReactionType;
      if (REACTION_TYPES.includes(type)) {
        counts[type]++;
        if (reaction.user_id === user.id) {
          userReactions.push(type);
        }
      }
    });

    return NextResponse.json({
      success: true,
      action,
      data: {
        counts,
        userReactions
      }
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
 * Creates a new notification or updates an existing one within 24h window
 * for the same actor/memorial/type combination (grouping)
 * Uses Service Role client to bypass RLS policies
 */
async function createOrUpdateNotification(
  recipientId: string,
  memorialId: string,
  actorId: string,
  actorName: string,
  actorAvatarUrl: string | null,
  reactionType: ReactionType
) {
  try {
    // Use service role client to bypass RLS for notification insert
    const serviceClient = createServiceSupabase();

    // Check for existing notification from same actor within 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: existingNotification, error: selectError } = await serviceClient
      .from('notifications')
      .select('*')
      .eq('recipient_id', recipientId)
      .eq('memorial_id', memorialId)
      .eq('actor_id', actorId)
      .eq('type', 'reaction')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected if no existing notification
      console.error('Error checking existing notification:', selectError);
    }

    if (existingNotification) {
      // Update existing notification (add reaction type if not already present)
      const currentTypes = existingNotification.reaction_types || [];
      const updatedTypes = currentTypes.includes(reactionType)
        ? currentTypes
        : [...currentTypes, reactionType];

      const { error: updateError } = await serviceClient
        .from('notifications')
        .update({
          reaction_types: updatedTypes,
          reaction_count: updatedTypes.length,
          is_read: false, // Mark as unread again
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingNotification.id);

      if (updateError) {
        console.error('Error updating notification:', updateError);
      }
    } else {
      // Create new notification
      const { error: insertError } = await serviceClient
        .from('notifications')
        .insert({
          recipient_id: recipientId,
          memorial_id: memorialId,
          type: 'reaction',
          actor_id: actorId,
          actor_name: actorName,
          actor_avatar_url: actorAvatarUrl,
          reaction_types: [reactionType],
          reaction_count: 1,
          is_read: false,
        });

      if (insertError) {
        console.error('Error inserting notification:', insertError);
      }
    }
  } catch (error) {
    // Log but don't fail the request if notification creation fails
    console.error('Error creating/updating notification:', error);
  }
}
