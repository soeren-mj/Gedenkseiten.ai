import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * PATCH /api/notifications/read-all
 *
 * Marks all notifications as read for the current user.
 *
 * Query Parameters:
 * - type: string (optional) - Only mark notifications of this type as read
 * - memorial_id: string (optional) - Only mark notifications for this memorial as read
 *
 * Response:
 * {
 *   success: boolean;
 *   data: {
 *     updatedCount: number;
 *   }
 * }
 */
export async function PATCH(request: Request) {
  try {
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

    // 2. Parse optional filters from query params
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const memorialId = url.searchParams.get('memorial_id');

    // 3. Build update query
    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    if (type) {
      query = query.eq('type', type);
    }

    if (memorialId) {
      query = query.eq('memorial_id', memorialId);
    }

    const { error, count } = await query.select('id');

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Markieren als gelesen' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: count || 0
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
