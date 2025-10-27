'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-legacy'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { User, MemorialInvitation } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  authUser: AuthUser | null
  loading: boolean
  invitations: MemorialInvitation[]
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUserName: (name: string | null) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  authUser: null,
  loading: true,
  invitations: [],
  signOut: async () => {},
  refreshUser: async () => {},
  updateUserName: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState<MemorialInvitation[]>([])
  const router = useRouter()

  const fetchUserProfile = useCallback(async (authUser: AuthUser) => {
    // Create fresh Supabase client for each call
    const supabase = createClient()
    try {
      console.log('[AuthContext] Fetching user profile for:', {
        userId: authUser.id,
        userEmail: authUser.email,
        hasMetadata: !!authUser.user_metadata,
      })

      // Get user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      console.log('[AuthContext] Profile query result:', {
        profile: profile ? 'found' : 'not found',
        error: error ? { code: error.code, message: error.message } : null
      })
      
      if (profile) {
        console.log('[AuthContext] ✅ User profile found in database')
        setUser(profile)
      } else if (error?.code === 'PGRST116') {
        // Table doesn't exist or no rows found - create profile
        console.log('[AuthContext] No profile found (PGRST116), attempting to create new profile...')
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata.full_name || null,
            avatar_url: authUser.user_metadata.avatar_url || null,
            theme_preference: 'system',
            notification_preferences: {
              memorial_activity: true,
              moderation_required: true,
              reminders: true,
              new_features: true,
            },
          })
          .select()
          .single()

        console.log('[AuthContext] Profile creation result:', {
          success: !!newProfile,
          error: insertError ? { code: insertError.code, message: insertError.message } : null
        })

        if (newProfile) {
          console.log('[AuthContext] ✅ New profile created successfully')
          setUser(newProfile)
        } else if (insertError?.code === '42P01') {
          // Table doesn't exist - create a minimal user object
          console.warn('[AuthContext] ⚠️ Users table does not exist (42P01), creating minimal user object in memory only')
          setUser({
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata.full_name || null,
            avatar_url: authUser.user_metadata.avatar_url || null,
            theme_preference: 'system',
            notification_preferences: {
              memorial_activity: true,
              moderation_required: true,
              reminders: true,
              new_features: true,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }

      // Check for invitations (only if users table exists)
      if (authUser.email && !error?.code) {
        try {
          console.log('[AuthContext] Fetching invitations for:', authUser.email)
          const { data: userInvitations, error: invitationError } = await supabase
            .from('memorial_invitations')
            .select(`
              *,
              memorials:memorial_id (
                first_name,
                last_name,
                avatar_url
              )
            `)
            .eq('invited_email', authUser.email)
            .eq('status', 'pending')

          if (invitationError) {
            console.log('[AuthContext] Invitation fetch error (table may not exist yet):', {
              code: invitationError.code,
              message: invitationError.message
            })
          } else if (userInvitations) {
            console.log('[AuthContext] Found', userInvitations.length, 'pending invitations')
            setInvitations(userInvitations as MemorialInvitation[])
          }
        } catch (invitationError) {
          console.log('[AuthContext] Invitation fetch exception (table may not exist):', invitationError)
          // Silently handle invitation errors - table may not exist yet
        }
      }
    } catch (error) {
      console.error('[AuthContext] Profile fetch error:', error)
      // Create minimal user object as fallback
      setUser({
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata.full_name || null,
        avatar_url: authUser.user_metadata.avatar_url || null,
        theme_preference: 'system',
        notification_preferences: {
          memorial_activity: true,
          moderation_required: true,
          reminders: true,
          new_features: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }, []) // Empty deps - supabase is recreated on each render

  const refreshUser = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      await fetchUserProfile(authUser)
    }
  }

  useEffect(() => {
    // Create Supabase client once for the effect
    const supabase = createClient()

    // Get initial session
    const initAuth = async () => {
      try {
        console.log('[AuthContext] Initializing auth, getting session...')

        // Add timeout to detect hanging getSession calls
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('getSession timeout after 10 seconds')), 10000)
        })

        const sessionPromise = supabase.auth.getSession()

        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ])

        // Type guard: if we get here without rejection, it's the session result
        const { data: { session } } = result as Awaited<typeof sessionPromise>

        console.log('[AuthContext] getSession completed')

        if (session?.user) {
          console.log('[AuthContext] Initial session found for user:', session.user.email)
          setAuthUser(session.user)
          setLoading(false)
          // Fetch profile in background (don't await)
          fetchUserProfile(session.user)
        } else {
          console.log('[AuthContext] No initial session found')
          setLoading(false)
        }
      } catch (error) {
        console.error('[AuthContext] Error in initAuth:', error)
        console.error('[AuthContext] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event, 'User:', session?.user?.email || 'none')

      if (session?.user) {
        setAuthUser(session.user)
        setLoading(false)
        // Fetch profile in background (don't await)
        fetchUserProfile(session.user)
      } else {
        setAuthUser(null)
        setUser(null)
        setInvitations([])
        setLoading(false)
      }

      // Handle auth events - only redirect if not already on target page
      if (event === 'SIGNED_IN') {
        // Only redirect if we're not already on dashboard or auth pages
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/dashboard') && !currentPath.startsWith('/auth/callback')) {
          console.log('[AuthContext] SIGNED_IN event, redirecting to /dashboard from:', currentPath)
          router.push('/dashboard')
        } else {
          console.log('[AuthContext] SIGNED_IN event, already on dashboard/callback, skipping redirect')
        }
      } else if (event === 'SIGNED_OUT') {
        const currentPath = window.location.pathname
        if (currentPath !== '/') {
          console.log('[AuthContext] SIGNED_OUT event, redirecting to /')
          router.push('/')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, fetchUserProfile])

  const signOut = async () => {
    const supabase = createClient()
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAuthUser(null)
      setInvitations([])
      router.push('/')
    } catch (error) {
      console.error('[AuthContext] Error signing out:', error)
    }
  }

  const updateUserName = async (name: string | null) => {
    const supabase = createClient()
    try {
      if (!authUser) {
        throw new Error('No authenticated user')
      }

      console.log('[AuthContext] Updating user name to:', name)

      // Optimistic update: Update local state immediately
      if (user) {
        setUser({
          ...user,
          name: name || null
        })
      }

      // Update name in Supabase users table
      const { error } = await supabase
        .from('users')
        .update({ name: name || null })
        .eq('id', authUser.id)

      if (error) {
        console.error('[AuthContext] Error updating user name:', error)
        // Rollback optimistic update on error
        await refreshUser()
        throw error
      }

      console.log('[AuthContext] User name updated successfully')

      // Refresh in background without blocking (optional, for other data sync)
      refreshUser().catch(err => {
        console.error('[AuthContext] Background refresh error:', err)
      })

    } catch (error) {
      console.error('[AuthContext] Error in updateUserName:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        loading,
        invitations,
        signOut,
        refreshUser,
        updateUserName,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}