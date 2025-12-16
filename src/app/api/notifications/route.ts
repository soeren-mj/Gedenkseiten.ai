import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * GET /api/notifications
 *
 * Fetches notifications for the current user.
 * Supports filtering and pagination.
 *
 * Query Parameters:
 * - unread_only: boolean (default: false) - Only return unread notifications
 * - type: string - Filter by notification type (reaction, kondolenz, beitrag)
 * - limit: number (default: 20, max: 50) - Number of notifications to return
 * - offset: number (default: 0) - Offset for pagination
 *
 * Response:
 * {
 *   success: boolean;
 *   data: {
 *     notifications: Notification[];
 *     total: number;
 *     hasMore: boolean;
 *   }
 * }
 */
export async function GET(request: Request) {
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

    // 2. Parse query parameters
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unread_only') === 'true';
    const type = url.searchParams.get('type');
    const memorialId = url.searchParams.get('memorial_id');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 3. Build query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (memorialId) {
      query = query.eq('memorial_id', memorialId);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Laden der Benachrichtigungen' },
        { status: 500 }
      );
    }

    // 4. Get memorial names for notifications
    const memorialIds = [...new Set((notifications || []).map(n => n.memorial_id).filter(Boolean))] as string[];

    let memorialNames: { [key: string]: string } = {};
    if (memorialIds.length > 0) {
      const { data: memorials } = await supabase
        .from('memorials')
        .select('id, first_name, last_name')
        .in('id', memorialIds);

      if (memorials) {
        memorialNames = memorials.reduce((acc: { [key: string]: string }, m) => {
          acc[m.id] = m.last_name ? `${m.first_name} ${m.last_name}` : m.first_name;
          return acc;
        }, {});
      }
    }

    // 5. Enrich notifications with memorial names
    const enrichedNotifications = (notifications || []).map(n => ({
      ...n,
      memorial_name: n.memorial_id ? memorialNames[n.memorial_id] || 'Gedenkseite' : null
    }));

    return NextResponse.json({
      success: true,
      data: {
        notifications: enrichedNotifications,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
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
