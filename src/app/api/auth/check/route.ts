import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      // User doesn't exist - return generic response for privacy
      return NextResponse.json({
        userExists: false,
        authMethods: ['magic-link'],
      })
    }

    // User exists - check their auth methods
    // For now, we'll return magic-link as the primary method
    // In a real implementation, you would check auth.users for password presence
    // and auth.identities for OAuth providers
    const authMethods: string[] = ['magic-link']
    
    // TODO: Check if user has password set in auth.users table
    // This would require admin access or a custom RPC function
    
    return NextResponse.json({
      userExists: true,
      authMethods,
      // Note: We don't expose hasPassword directly for privacy
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}