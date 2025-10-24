'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, authUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check authUser (session) instead of user (profile) to avoid race condition
    // user might still be loading from database, but authUser is set immediately
    if (!loading && !authUser) {
      router.push(redirectTo)
    }
  }, [authUser, loading, router, redirectTo])

  return { user, loading }
}