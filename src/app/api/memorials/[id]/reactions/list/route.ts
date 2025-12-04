import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database, ReactionType } from '@/lib/supabase';
import { createServiceSupabase } from '@/lib/supabase';

/**
 * GET /api/memorials/[id]/reactions/list
 *
 * Fetches a chronological list of all reactions for a memorial,
 * grouped by user with their reaction types.
 * Used for the ReaktionenPage management view.
 *
 * Response:
 * {
 *   success: boolean;
 *   data: {
 *     reactions: Array<{
 *       user_id: string;
 *       user_name: string;
 *       user_avatar_url: string | null;
 *       reaction_types: ReactionType[];
 *       latest_reaction_at: string;
 *     }>;
 *     counts: { [key in ReactionType]: number };
 *   }
 * }
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

    // Check if user is authenticated (optional for access check)
    const authHeader = request.headers.get('authorization');
    let authenticatedClient = supabase;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      authenticatedClient = createSupabaseClient<Database>(
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
    }

    // Fetch all reactions for this memorial with user info
    const { data: reactions, error } = await authenticatedClient
      .from('memorial_reactions')
      .select(`
        id,
        user_id,
        reaction_type,
        created_at
      `)
      .eq('memorial_id', memorialId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reactions list:', error);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Laden der Reaktionen' },
        { status: 500 }
      );
    }

    // Get user profiles for the reactions
    const userIds = [...new Set((reactions || []).map((r: { user_id: string }) => r.user_id))];

    // Fetch user profiles from auth.users metadata
    // Since we can't directly query auth.users, we'll use the profiles or users table
    // For now, we'll just use the user_id and let the frontend display it
    // In production, you'd have a profiles table with user info

    // Group reactions by user
    const userReactionsMap = new Map<string, {
      user_id: string;
      reaction_types: ReactionType[];
      latest_reaction_at: string;
    }>();

    const counts: { [key in ReactionType]: number } = {
      liebe: 0,
      dankbarkeit: 0,
      freiheit: 0,
      blumen: 0,
      kerze: 0
    };

    (reactions || []).forEach((reaction: { user_id: string; reaction_type: string; created_at: string }) => {
      const type = reaction.reaction_type as ReactionType;
      counts[type]++;

      const existing = userReactionsMap.get(reaction.user_id);
      if (existing) {
        if (!existing.reaction_types.includes(type)) {
          existing.reaction_types.push(type);
        }
        // Update latest_reaction_at if this reaction is newer
        if (new Date(reaction.created_at) > new Date(existing.latest_reaction_at)) {
          existing.latest_reaction_at = reaction.created_at;
        }
      } else {
        userReactionsMap.set(reaction.user_id, {
          user_id: reaction.user_id,
          reaction_types: [type],
          latest_reaction_at: reaction.created_at
        });
      }
    });

    // Convert to array and sort by latest reaction
    const groupedReactions = Array.from(userReactionsMap.values())
      .sort((a, b) => new Date(b.latest_reaction_at).getTime() - new Date(a.latest_reaction_at).getTime())
      .map(reaction => ({
        ...reaction,
        // Placeholder for user info - in production, fetch from profiles table
        user_name: 'Besucher', // Will be updated with real user names
        user_avatar_url: null as string | null
      }));

    // Try to fetch user profiles if available
    if (userIds.length > 0) {
      // Use service client to bypass RLS for reading public profile info (name, avatar_url)
      // This is safe because we only read non-sensitive data
      const serviceClient = createServiceSupabase();

      // First try to get profiles from users table
      const { data: profiles } = await serviceClient
        .from('users')
        .select('id, name, avatar_url')
        .in('id', userIds);

      // Build profile map from users table
      const profileMap = new Map<string, { name: string | null; avatar_url: string | null }>();
      if (profiles) {
        profiles.forEach((p: { id: string; name: string | null; avatar_url: string | null }) => {
          profileMap.set(p.id, { name: p.name, avatar_url: p.avatar_url });
        });
      }

      // For users not in users table or with null names, try to get from auth.users via service role
      const missingUserIds = userIds.filter(id => {
        const profile = profileMap.get(id);
        return !profile || !profile.name;
      });

      if (missingUserIds.length > 0) {
        try {
          // Reuse serviceClient from above
          // Fetch auth.users data using admin API
          const { data: authUsers } = await serviceClient.auth.admin.listUsers();

          if (authUsers?.users) {
            authUsers.users.forEach(authUser => {
              if (missingUserIds.includes(authUser.id)) {
                const existingProfile = profileMap.get(authUser.id);
                const name = authUser.user_metadata?.full_name
                  || authUser.user_metadata?.name
                  || authUser.email?.split('@')[0]
                  || null;
                const avatarUrl = authUser.user_metadata?.avatar_url || null;

                // Update profile map with auth data (only if missing from users table)
                profileMap.set(authUser.id, {
                  name: existingProfile?.name || name,
                  avatar_url: existingProfile?.avatar_url || avatarUrl
                });
              }
            });
          }
        } catch (authError) {
          console.error('Error fetching auth users:', authError);
          // Continue with what we have from users table
        }
      }

      // Apply profiles to grouped reactions
      groupedReactions.forEach(reaction => {
        const profile = profileMap.get(reaction.user_id);
        if (profile) {
          reaction.user_name = profile.name || 'Besucher';
          reaction.user_avatar_url = profile.avatar_url;
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        reactions: groupedReactions,
        counts
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
