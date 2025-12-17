'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client-legacy'
import { Button } from '@/components/ui/Button'
import AddMemorialCard from '@/components/cards/AddMemorialCard'
import { MemorialCard } from '@/components/cards/MemorialCard'
import UserProfileCard from '@/components/dashboard/UserProfileCard'
import ToDoCard from '@/components/dashboard/ToDoCard'
import type { Memorial } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { formatFullName } from '@/lib/utils/nameFormatter'

// Inspirational quotes for returning users
const QUOTES = [
  { text: 'Die Wege des Herren sind unergründlich', author: 'Confuzius 844 v.Chr.' },
  { text: 'Was wir für die Verstorbenen tun, tun wir auch für uns selbst', author: 'Unbekannt' },
  { text: 'Erinnerungen sind kleine Sterne, die tröstend in das Dunkel unserer Trauer leuchten', author: 'Unbekannt' },
]

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, invitations } = useAuth()
  const { showSuccess } = useToast()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const welcomeToastShown = useRef(false)

  // Show welcome toast for new registrations
  useEffect(() => {
    // Prevent double-firing in React Strict Mode
    if (welcomeToastShown.current) return

    if (searchParams.get('welcome') === 'true') {
      welcomeToastShown.current = true
      showSuccess(
        'Schön, herzlich Willkommen.',
        'Wir freuen uns über deine erfolgreiche Registrierung. Lege ein paar persönliche Einstellungen fest und dann kannst du mit der Erstellung deiner ersten Gedenkseite beginnen.',
        undefined,
        false
      )
      // Clean URL without reload
      router.replace('/dashboard', { scroll: false })
    }
  }, [searchParams, showSuccess, router])

  // Fetch user's memorials
  useEffect(() => {
    if (!user?.id) return

    const fetchMemorials = async () => {
      try {
        setError(null)
        const supabase = createClient()
        const { data, error } = await supabase
          .from('memorials')
          .select('id, type, first_name, last_name, avatar_type, avatar_url, privacy_level, view_count, created_at')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          logger.error({
            context: 'Dashboard:fetchMemorials',
            error,
            userId: user?.id,
          })
          setError('Fehler beim Laden der Gedenkseiten. Bitte versuche es später erneut.')
          return
        }

        setMemorials(data || [])
      } catch (err) {
        logger.error({
          context: 'Dashboard:fetchMemorials:catch',
          error: err,
          userId: user?.id,
        })
        setError('Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu.')
      } finally {
        setLoading(false)
      }
    }

    fetchMemorials()
  }, [user?.id])

  // Handler for creating new memorial
  const handleCreateMemorial = () => {
    router.push('/gedenkseite/neu')
  }

  // Get display name
  const displayName = user?.name || user?.email?.split('@')[0] || 'Benutzer'
  const hasMemorials = memorials.length > 0

  // Get random quote for returning users
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

  return (
    <div className="flex flex-col gap-2 mb-10">
      {/* Headline Section */}
      <div className="flex flex-col gap-2 py-10 text-center items-center">
        <h1 className="text-webapp-section text-primary">
          Hi <span className="font-semibold">{displayName}</span>, schön das du da bist!
        </h1>
        {hasMemorials ? (
          <p className="text-body-m text-secondary max-w-[685px]">
            &quot;{randomQuote.text}&quot; – {randomQuote.author}
          </p>
        ) : (
          <p className="text-body-m text-secondary max-w-[685px]">
            Lege eine Gedenkseite an und halte ein Stück Leben unvergessen.
          </p>
        )}
      </div>

      {/* Invitation Banner */}
      {invitations.length > 0 && (
        <div className="max-w-5xl mx-auto w-full mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>

              <div className="flex-1">
                <h2 className="text-body-l font-semibold mb-2">
                  Du hast {invitations.length} ausstehende Einladung{invitations.length > 1 ? 'en' : ''}
                </h2>
                <p className="text-white/90 mb-4 text-body-m">
                  {invitations.length === 1
                    ? 'Du wurdest zu einer Gedenkseite eingeladen.'
                    : `Du wurdest zu ${invitations.length} Gedenkseiten eingeladen.`
                  }
                </p>

                <div className="space-y-2 mb-4">
                  {invitations.slice(0, 2).map((invitation) => {
                    const memorial = invitation.memorials as { first_name: string; last_name: string | null } | null;
                    const memorialName = memorial ? formatFullName(memorial) : '';
                    return (
                      <div key={invitation.id} className="text-white/90 text-body-s">
                        • Gedenkseite{memorialName ? ` von ${memorialName}` : ''}
                      </div>
                    );
                  })}
                  {invitations.length > 2 && (
                    <div className="text-white/90 text-body-s">
                      • und {invitations.length - 2} weitere...
                    </div>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-purple-700 hover:bg-white/90"
                >
                  Einladungen verwalten
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hub Container */}
      <div className="flex flex-col gap-8 pt-4 items-center overflow-visible">
        {error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 max-w-md">
            <h3 className="text-body-l font-medium text-red-800 dark:text-red-200 mb-2">Fehler</h3>
            <p className="text-body-m text-red-700 dark:text-red-300">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Seite neu laden
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <p className="text-secondary">Laden...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 max-w-7xl w-full overflow-visible">
            {/* a) UserProfileCard - AUSSERHALB des Grids, links */}
            <div className="overflow-visible">
              <UserProfileCard
                name={user?.name}
                email={user?.email}
                avatarUrl={user?.avatar_url}
                accountType={(user as { account_type?: string })?.account_type as 'free' | 'premium' | undefined}
              />
            </div>

            {/* b) Grid Container - rechts daneben */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* New User: Show ToDoCard spanning 2 columns + AddMemorialCard */}
                {!hasMemorials && (
                  <>
                    <ToDoCard
                      userName={user?.name}
                      userAvatarUrl={user?.avatar_url}
                      className="md:col-span-2"
                    />
                    <AddMemorialCard onClick={handleCreateMemorial} />
                  </>
                )}

                {/* Returning User: Show AddMemorialCard + MemorialCards */}
                {hasMemorials && (
                  <>
                    <AddMemorialCard onClick={handleCreateMemorial} />
                    {memorials.map((memorial) => (
                      <MemorialCard
                        key={memorial.id}
                        memorial={{
                          id: memorial.id,
                          type: memorial.type as 'person' | 'pet' | 'tier',
                          first_name: memorial.first_name,
                          last_name: memorial.last_name,
                          avatar_type: memorial.avatar_type as 'initials' | 'image',
                          avatar_url: memorial.avatar_url,
                          privacy_level: memorial.privacy_level as 'public' | 'private',
                        }}
                        visitorCount={memorial.view_count || 0}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
