import { createClient } from './server'
import { redirect } from 'next/navigation'
import type { User } from '../supabase'

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // Get the full user profile from our users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function signInWithEmail(email: string) {
  const { createClient: createBrowserClient } = await import('./client')
  const supabase = createBrowserClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
    },
  })
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}

export async function signInWithProvider(provider: 'google' | 'apple' | 'azure') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  
  if (error) {
    return { error: error.message }
  }
  
  return { url: data.url }
}

export async function checkInvitation(email: string) {
  const supabase = await createClient()
  
  const { data: invitations } = await supabase
    .from('memorial_invitations')
    .select('*, memorials(first_name, last_name)')
    .eq('invited_email', email)
    .eq('status', 'pending')
  
  return invitations || []
}