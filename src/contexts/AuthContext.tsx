'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { User, MemorialInvitation } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  authUser: AuthUser | null
  loading: boolean
  invitations: MemorialInvitation[]
  hasPassword: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  authUser: null,
  loading: true,
  invitations: [],
  hasPassword: false,
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState<MemorialInvitation[]>([])
  const [hasPassword, setHasPassword] = useState(false)
  const router = useRouter()

  // Memoize Supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])

  const fetchUserProfile = useCallback(async (authUser: AuthUser) => {
    try {
      console.log('Fetching user profile for:', authUser.id)

      // Get user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      console.log('Profile query result:', { profile, error })

      if (profile) {
        setUser(profile)
        // Set hasPassword from database field
        setHasPassword(profile.has_password || false)
      } else if (error?.code === 'PGRST116') {
        // Table doesn't exist or no rows found - create profile
        console.log('Creating new user profile...')
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
            has_password: false, // Default to false for new users
          })
          .select()
          .single()

        console.log('Profile creation result:', { newProfile, insertError })

        if (newProfile) {
          setUser(newProfile)
          setHasPassword(newProfile.has_password || false)
        } else if (insertError?.code === '42P01') {
          // Table doesn't exist - create a minimal user object
          console.log('Users table does not exist, creating minimal user object')
          const minimalUser = {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata.full_name || null,
            avatar_url: authUser.user_metadata.avatar_url || null,
            theme_preference: 'system' as const,
            notification_preferences: {
              memorial_activity: true,
              moderation_required: true,
              reminders: true,
              new_features: true,
            },
            has_password: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setUser(minimalUser)
          setHasPassword(false)
        }
      }

      // Check for invitations (only if users table exists)
      if (authUser.email && !error?.code) {
        try {
          const { data: userInvitations } = await supabase
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

          if (userInvitations) {
            setInvitations(userInvitations as MemorialInvitation[])
          }
        } catch (invitationError) {
          console.log('Invitation fetch error (table may not exist):', invitationError)
          // Silently handle invitation errors - table may not exist yet
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      // Create minimal user object as fallback
      const fallbackUser = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata.full_name || null,
        avatar_url: authUser.user_metadata.avatar_url || null,
        theme_preference: 'system' as const,
        notification_preferences: {
          memorial_activity: true,
          moderation_required: true,
          reminders: true,
          new_features: true,
        },
        has_password: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setUser(fallbackUser)
      setHasPassword(false)
    }
  }, [supabase]) // Keep supabase since it's now stable with useMemo

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      await fetchUserProfile(authUser)
    }
  }

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setAuthUser(session.user)
          setLoading(false)
          // Fetch profile in background (don't await)
          fetchUserProfile(session.user)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('[AuthContext] Error in initAuth:', error)
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user)
        setLoading(false)
        // Fetch profile in background (don't await)
        fetchUserProfile(session.user)
      } else {
        setAuthUser(null)
        setUser(null)
        setInvitations([])
        setHasPassword(false)
        setLoading(false)
      }

      // Handle auth events
      if (event === 'SIGNED_IN') {
        router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase, fetchUserProfile])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAuthUser(null)
      setInvitations([])
      setHasPassword(false)
      router.push('/')
    } catch (error) {
      console.error('[AuthContext] Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        loading,
        invitations,
        hasPassword,
        signOut,
        refreshUser,
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