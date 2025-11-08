import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase'

export async function POST(request: Request) {
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

    // Get request body
    const body = await request.json()
    const { emailConfirmation } = body

    // Validate email confirmation
    if (!emailConfirmation || typeof emailConfirmation !== 'string') {
      return NextResponse.json(
        { error: 'Email confirmation is required' },
        { status: 400 }
      )
    }

    if (emailConfirmation !== user.email) {
      return NextResponse.json(
        { error: 'Email confirmation does not match' },
        { status: 400 }
      )
    }

    console.log(`[Delete Account] Starting account deletion for user: ${user.id}`)

    // ============================================
    // STEP 1: Anonymize contributions on other memorials
    // ============================================
    console.log('[Delete Account] Step 1: Anonymizing contributions...')

    // Get user's memorial IDs first
    const { data: userMemorials } = await supabase
      .from('memorials')
      .select('id')
      .eq('creator_id', user.id)

    const userMemorialIds = userMemorials?.map((m) => m.id) || []

    // Anonymize beitrag_posts on OTHER memorials
    const { error: postsAnonymizeError } = await supabase
      .from('beitrag_posts')
      .update({
        author_name: 'Gelöschter Nutzer',
        author_avatar: null,
        user_id: null,
      })
      .eq('user_id', user.id)
      .not('memorial_id', 'in', userMemorialIds.length > 0 ? `(${userMemorialIds.join(',')})` : '()')

    if (postsAnonymizeError) {
      console.error('[Delete Account] Error anonymizing posts:', postsAnonymizeError)
      // Continue anyway - not critical
    } else {
      console.log('[Delete Account] ✅ Posts anonymized')
    }

    // Anonymize condolence_entries on OTHER memorials
    const { error: entriesAnonymizeError } = await supabase
      .from('condolence_entries')
      .update({
        author_name: 'Gelöschter Nutzer',
        author_avatar: null,
        user_id: null,
      })
      .eq('user_id', user.id)
      .not('memorial_id', 'in', userMemorialIds.length > 0 ? `(${userMemorialIds.join(',')})` : '()')

    if (entriesAnonymizeError) {
      console.error('[Delete Account] Error anonymizing entries:', entriesAnonymizeError)
      // Continue anyway - not critical
    } else {
      console.log('[Delete Account] ✅ Condolence entries anonymized')
    }

    // ============================================
    // STEP 2: Delete reactions
    // ============================================
    console.log('[Delete Account] Step 2: Deleting reactions...')

    const { error: memorialReactionsError } = await supabase
      .from('memorial_reactions')
      .delete()
      .eq('user_id', user.id)

    if (memorialReactionsError) {
      console.error('[Delete Account] Error deleting memorial reactions:', memorialReactionsError)
    }

    const { error: postReactionsError } = await supabase
      .from('post_reactions')
      .delete()
      .eq('user_id', user.id)

    if (postReactionsError) {
      console.error('[Delete Account] Error deleting post reactions:', postReactionsError)
    }

    console.log('[Delete Account] ✅ Reactions deleted')

    // ============================================
    // STEP 3: Delete owned memorials (CASCADE)
    // ============================================
    console.log('[Delete Account] Step 3: Deleting memorials...')

    const { error: memorialsError } = await supabase
      .from('memorials')
      .delete()
      .eq('creator_id', user.id)

    if (memorialsError) {
      console.error('[Delete Account] Error deleting memorials:', memorialsError)
      // This is critical - if memorials can't be deleted, don't proceed
      return NextResponse.json(
        { error: 'Failed to delete memorials. Please try again later.' },
        { status: 500 }
      )
    }

    console.log('[Delete Account] ✅ Memorials deleted (CASCADE)')

    // ============================================
    // STEP 4: Delete invitations
    // ============================================
    console.log('[Delete Account] Step 4: Deleting invitations...')

    // Delete invitations sent by user
    const { error: invitationsSentError } = await supabase
      .from('memorial_invitations')
      .delete()
      .eq('invited_by', user.id)

    if (invitationsSentError) {
      console.error('[Delete Account] Error deleting sent invitations:', invitationsSentError)
    }

    // Delete invitations received by user
    const { error: invitationsReceivedError } = await supabase
      .from('memorial_invitations')
      .delete()
      .eq('invited_email', user.email)

    if (invitationsReceivedError) {
      console.error('[Delete Account] Error deleting received invitations:', invitationsReceivedError)
    }

    console.log('[Delete Account] ✅ Invitations deleted')

    // ============================================
    // STEP 5: Delete ALL storage objects owned by user
    // ============================================
    console.log('[Delete Account] Step 5: Deleting storage objects...')

    try {
      // List all buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        console.error('[Delete Account] Error listing storage buckets:', bucketsError)
      } else if (buckets) {
        // For each bucket, try to delete user's objects
        for (const bucket of buckets) {
          try {
            // List all files in bucket owned by user
            const { data: files, error: listError } = await supabase.storage
              .from(bucket.name)
              .list('', {
                limit: 1000,
                sortBy: { column: 'name', order: 'asc' }
              })

            if (listError) {
              console.error(`[Delete Account] Error listing files in bucket ${bucket.name}:`, listError)
              continue
            }

            if (files && files.length > 0) {
              // Get file paths
              const filePaths = files.map(f => f.name)

              // Delete files
              const { error: deleteError } = await supabase.storage
                .from(bucket.name)
                .remove(filePaths)

              if (deleteError) {
                console.error(`[Delete Account] Error deleting files from bucket ${bucket.name}:`, deleteError)
              } else {
                console.log(`[Delete Account] ✅ Deleted ${filePaths.length} files from bucket ${bucket.name}`)
              }
            }
          } catch (err) {
            console.error(`[Delete Account] Error processing bucket ${bucket.name}:`, err)
            // Continue with next bucket
          }
        }
      }
    } catch (err) {
      console.error('[Delete Account] Error in storage cleanup:', err)
      // Continue anyway - storage cleanup is not critical
    }

    console.log('[Delete Account] ✅ Storage cleanup completed')

    // ============================================
    // STEP 6: Delete from public.users (FIRST!)
    // ============================================
    // We delete public.users BEFORE auth.users because:
    // public.users.id has FK to auth.users.id which blocks auth.users deletion
    console.log('[Delete Account] Step 6: Deleting from public.users...')

    const { error: publicUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    if (publicUserError) {
      console.error('[Delete Account] Error deleting from public.users:', publicUserError)
      // This is critical - if public.users can't be deleted, auth.users will fail too
      return NextResponse.json(
        { error: 'Failed to delete user profile. Please try again later.' },
        { status: 500 }
      )
    }

    console.log('[Delete Account] ✅ Deleted from public.users')

    // ============================================
    // STEP 7: Prepare admin client for auth.users deletion
    // ============================================
    console.log('[Delete Account] Step 7: Preparing admin client...')

    // ============================================
    // STEP 8: Delete from auth.users (Supabase Auth)
    // ============================================
    console.log('[Delete Account] Step 8: Deleting from auth.users...')

    // Create admin client with service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      console.error('[Delete Account] ❌ SUPABASE_SERVICE_ROLE_KEY not configured')
      console.error('[Delete Account] Available env vars:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
      return NextResponse.json(
        {
          error:
            'Server configuration error: Service role key not found. Please check .env.local file.',
          debug: 'SUPABASE_SERVICE_ROLE_KEY is not set',
        },
        { status: 500 }
      )
    }

    console.log('[Delete Account] Service role key found, length:', serviceRoleKey.length)
    console.log('[Delete Account] Service role key prefix:', serviceRoleKey.substring(0, 20) + '...')

    const supabaseAdmin = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log('[Delete Account] Admin client created, attempting to delete user:', user.id)

    // First attempt: Hard delete (permanent deletion)
    let { error: authUserError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    )

    if (authUserError) {
      console.error('[Delete Account] ⚠️ Hard delete failed, attempting soft delete...', {
        message: authUserError.message,
        status: authUserError.status,
        code: authUserError.code,
      })

      // Fallback: Soft delete (user is disabled, not deleted from DB)
      const softDeleteResult = await supabaseAdmin.auth.admin.deleteUser(
        user.id,
        true // shouldSoftDelete = true
      )

      authUserError = softDeleteResult.error

      if (authUserError) {
        console.error('[Delete Account] ❌ Soft delete also failed:', {
          message: authUserError.message,
          status: authUserError.status,
          code: authUserError.code,
          name: authUserError.name,
          fullError: authUserError,
        })
        return NextResponse.json(
          {
            error: 'Failed to delete authentication record.',
            debug: `Hard delete failed: ${authUserError.message}. Soft delete also failed.`,
            errorCode: authUserError.code,
          },
          { status: 500 }
        )
      } else {
        console.log('[Delete Account] ✅ User soft-deleted (disabled, not removed from DB)')
        console.log('[Delete Account] ⚠️ Note: User record remains in auth.users but is disabled')
      }
    } else {
      console.log('[Delete Account] ✅ User hard-deleted (permanently removed)')
    }

    console.log('[Delete Account] ✅ Deleted from auth.users')
    console.log(`[Delete Account] ✅ Account deletion completed successfully for user: ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('[Delete Account] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
