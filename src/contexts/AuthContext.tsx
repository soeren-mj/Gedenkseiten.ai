'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
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
  updateUserAvatar: (avatarUrl: string) => Promise<void>
  deleteUserAvatar: () => Promise<void>
  updateUserEmail: (newEmail: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  authUser: null,
  loading: true,
  invitations: [],
  signOut: async () => {},
  refreshUser: async () => {},
  updateUserName: async () => {},
  updateUserAvatar: async () => {},
  deleteUserAvatar: async () => {},
  updateUserEmail: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState<MemorialInvitation[]>([])
  const router = useRouter()
  const { showError } = useToast()

  const fetchUserProfile = useCallback(async (authUser: AuthUser) => {
    // Get singleton Supabase client instance
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
        .maybeSingle()

      console.log('[AuthContext] Profile query result:', {
        profile: profile ? 'found' : 'not found',
        error: error ? { code: error.code, message: error.message } : null
      })

      if (profile) {
        console.log('[AuthContext] ✅ User profile found in database')
        setUser(profile)
      } else if (!profile) {
        // Profile not found - create it with retry logic
        // This handles three cases:
        // 1. No rows found (profile = null, error = null) - normal case
        // 2. PGRST116 error (table doesn't exist) - setup case
        // 3. Unexpected error (406, etc.) - edge case
        if (error?.code === 'PGRST116') {
          console.log('[AuthContext] No profile found (PGRST116), attempting to create new profile...')
        } else if (error) {
          console.error('[AuthContext] ⚠️ Unexpected profile fetch error:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          })
          console.log('[AuthContext] Attempting to create profile due to unexpected error...')
        } else {
          console.log('[AuthContext] Profile not found in database, creating new profile...')
        }

        let retries = 3
        let newProfile = null
        let insertError = null

        // Retry loop for robust profile creation
        while (retries > 0 && !newProfile) {
          const attemptNumber = 4 - retries
          console.log(`[AuthContext] Profile creation attempt ${attemptNumber}/3`)

          const result = await supabase
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

          newProfile = result.data
          insertError = result.error

          if (newProfile) {
            console.log('[AuthContext] ✅ New profile created successfully')
            break
          }

          if (insertError) {
            console.error(`[AuthContext] ❌ Profile creation attempt ${attemptNumber}/3 failed:`, {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint
            })

            // Don't retry for certain error types
            if (insertError.code === '42P01') {
              console.error('[AuthContext] ⚠️ Users table does not exist (42P01), stopping retries')
              break
            }

            if (insertError.code === '23505') {
              console.error('[AuthContext] ⚠️ Profile already exists (23505), stopping retries')
              // Try to fetch the existing profile
              const { data: existingProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle()

              if (existingProfile) {
                newProfile = existingProfile
                console.log('[AuthContext] ✅ Fetched existing profile instead')
              }
              break
            }

            retries--

            // Wait 1 second before next attempt (unless this was the last attempt)
            if (retries > 0) {
              console.log(`[AuthContext] ⏳ Waiting 1 second before retry (${retries} attempts remaining)...`)
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }

        console.log('[AuthContext] Profile creation result:', {
          success: !!newProfile,
          attemptsUsed: 4 - retries,
          finalError: insertError ? { code: insertError.code, message: insertError.message } : null
        })

        if (newProfile) {
          console.log('[AuthContext] ✅ Profile set in state')
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
        } else {
          // All retries failed - this is a CRITICAL error
          console.error('[AuthContext] ❌ CRITICAL: Failed to create profile after 3 attempts!')
          console.error('[AuthContext] User ID:', authUser.id)
          console.error('[AuthContext] User Email:', authUser.email)
          console.error('[AuthContext] Final Error:', insertError)

          // Show error notification to user
          showError(
            'Profil-Synchronisationsfehler',
            `Ihr Benutzerprofil konnte nicht erstellt werden. Bitte kontaktieren Sie den Support mit dieser User-ID: ${authUser.id.substring(0, 8)}...`
          )

          // Create in-memory fallback but mark it as failed
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
          console.warn('[AuthContext] ⚠️ Invitation fetch exception:', {
            error: invitationError,
            note: 'This is expected during initial setup if memorial_invitations table does not exist yet'
          })
          // Continue execution - invitations are optional
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
  }, [showError]) // createClient() returns singleton instance, showError for toast notifications

  const refreshUser = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      await fetchUserProfile(authUser)
    }
  }

  useEffect(() => {
    // Get singleton Supabase client instance (same instance used throughout app)
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
        // Only redirect if we're not already on dashboard, auth, or memorial pages
        const currentPath = window.location.pathname
        const isOnDashboard = currentPath.startsWith('/dashboard')
        const isOnAuthCallback = currentPath.startsWith('/auth/callback')
        const isOnMemorialPage = currentPath.startsWith('/gedenkseite')

        if (!isOnDashboard && !isOnAuthCallback && !isOnMemorialPage) {
          // Check for redirect parameter in URL (e.g., from login page with ?redirect=...)
          const urlParams = new URLSearchParams(window.location.search)
          const redirectUrl = urlParams.get('redirect')

          if (redirectUrl && redirectUrl.startsWith('/')) {
            console.log('[AuthContext] SIGNED_IN event, redirecting to:', redirectUrl)
            router.push(redirectUrl)
          } else {
            console.log('[AuthContext] SIGNED_IN event, redirecting to /dashboard from:', currentPath)
            router.push('/dashboard')
          }
        } else {
          console.log('[AuthContext] SIGNED_IN event, already on dashboard/callback/memorial, skipping redirect')
        }
      } else if (event === 'SIGNED_OUT') {
        const currentPath = window.location.pathname
        if (currentPath !== '/' && currentPath !== '/auth/login') {
          console.log('[AuthContext] SIGNED_OUT event, redirecting to login')
          // Check if this was triggered by account deletion
          // (user will be on /dashboard/settings when deletion completes)
          if (currentPath.includes('/dashboard/settings')) {
            router.push('/auth/login?reason=account_deleted')
          } else {
            router.push('/auth/login')
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, fetchUserProfile])

  const signOut = async () => {
    const supabase = createClient()
    try {
      await supabase.auth.signOut()
      router.push('/')        // Erst navigieren (kein Flackern)
      setUser(null)           // Dann State leeren
      setAuthUser(null)
      setInvitations([])
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

  const updateUserAvatar = async (avatarUrl: string) => {
    const supabase = createClient()
    try {
      if (!authUser) {
        throw new Error('No authenticated user')
      }

      console.log('[AuthContext] Updating user avatar to:', avatarUrl)

      // Optimistic update: Update local state immediately
      if (user) {
        setUser({
          ...user,
          avatar_url: avatarUrl
        })
      }

      // Update avatar_url in Supabase users table
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', authUser.id)

      if (error) {
        console.error('[AuthContext] Error updating user avatar:', error)
        // Rollback optimistic update on error
        await refreshUser()
        throw error
      }

      console.log('[AuthContext] User avatar updated successfully')

      // Refresh in background without blocking (optional, for other data sync)
      refreshUser().catch(err => {
        console.error('[AuthContext] Background refresh error:', err)
      })

    } catch (error) {
      console.error('[AuthContext] Error in updateUserAvatar:', error)
      throw error
    }
  }

  const deleteUserAvatar = async () => {
    const supabase = createClient()
    try {
      if (!authUser) {
        throw new Error('No authenticated user')
      }

      console.log('[AuthContext] Deleting user avatar')

      // Optimistic update: Update local state immediately
      if (user) {
        setUser({
          ...user,
          avatar_url: null
        })
      }

      // Update avatar_url to null in Supabase users table
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', authUser.id)

      if (error) {
        console.error('[AuthContext] Error deleting user avatar:', error)
        // Rollback optimistic update on error
        await refreshUser()
        throw error
      }

      console.log('[AuthContext] User avatar deleted successfully')

      // Refresh in background without blocking (optional, for other data sync)
      refreshUser().catch(err => {
        console.error('[AuthContext] Background refresh error:', err)
      })

    } catch (error) {
      console.error('[AuthContext] Error in deleteUserAvatar:', error)
      throw error
    }
  }

  const updateUserEmail = async (newEmail: string) => {
    const supabase = createClient()
    try {
      if (!authUser) {
        throw new Error('No authenticated user')
      }

      const oldEmail = authUser.email

      console.log('[AuthContext] Requesting email change to:', newEmail)

      // Update email via Supabase Auth (sends confirmation email to new address)
      // Include emailRedirectTo with custom flow parameter to distinguish from signup
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: `${window.location.origin}/auth/callback?flow=email_change`
        }
      )

      if (error) {
        console.error('[AuthContext] Error requesting email change:', error)

        // Handle specific error cases
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          throw new Error('Diese E-Mail-Adresse wird bereits verwendet')
        }

        throw error
      }

      console.log('[AuthContext] Email change confirmation sent successfully')

      // Send notification to old email address (fire and forget)
      if (oldEmail) {
        fetch('/api/user/email/notify-old', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldEmail,
            newEmail,
          }),
        }).catch(err => {
          console.error('[AuthContext] Failed to send notification to old email:', err)
          // Don't throw - notification is not critical
        })
      }

      // Note: Email will be updated in auth.users and public.users tables
      // AFTER user confirms via email link. Database trigger will handle sync.

    } catch (error) {
      console.error('[AuthContext] Error in updateUserEmail:', error)
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
        updateUserAvatar,
        deleteUserAvatar,
        updateUserEmail,
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