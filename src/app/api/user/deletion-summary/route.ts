import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - No auth header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Create client with user's session token
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get user from token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    // Count memorials owned by user
    const { count: memorialCount, error: memorialError } = await supabase
      .from('memorials')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)

    if (memorialError) {
      console.error('Error counting memorials:', memorialError)
      return NextResponse.json(
        { error: 'Failed to count memorials' },
        { status: 500 }
      )
    }

    // Get memorial IDs for counting posts
    const { data: memorials, error: memorialIdsError } = await supabase
      .from('memorials')
      .select('id')
      .eq('creator_id', user.id)

    if (memorialIdsError) {
      console.error('Error fetching memorial IDs:', memorialIdsError)
      return NextResponse.json(
        { error: 'Failed to fetch memorial IDs' },
        { status: 500 }
      )
    }

    const memorialIds = memorials?.map((m) => m.id) || []

    // Count posts on user's memorials
    let totalPosts = 0
    if (memorialIds.length > 0) {
      const { count: postCount, error: postError } = await supabase
        .from('beitrag_posts')
        .select('*', { count: 'exact', head: true })
        .in('memorial_id', memorialIds)
        .is('deleted_at', null) // Only count non-deleted posts

      if (postError) {
        console.error('Error counting posts:', postError)
        // Don't fail, just set to 0
      } else {
        totalPosts = postCount || 0
      }
    }

    // Count contributions to other memorials (for anonymization)
    const { count: contributionCount, error: contributionError } = await supabase
      .from('beitrag_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('memorial_id', 'in', `(${memorialIds.join(',')})`)
      .is('deleted_at', null)

    if (contributionError) {
      console.error('Error counting contributions:', contributionError)
      // Don't fail, just set to 0
    }

    return NextResponse.json({
      memorialCount: memorialCount || 0,
      totalPosts,
      contributionCount: contributionCount || 0,
    })
  } catch (error) {
    console.error('Unexpected error in deletion-summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
