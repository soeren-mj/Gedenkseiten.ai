'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client-legacy'
import { Button } from '@/components/ui/Button'
import AddMemorialCard from '@/components/cards/AddMemorialCard'
import { MemorialCard } from '@/components/cards/MemorialCard'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import type { Memorial } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { formatFullName } from '@/lib/utils/nameFormatter'

export default function DashboardPage() {
  const router = useRouter()
  const { user, invitations } = useAuth()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="mx-auto max-w-3xl gap-8 flex flex-col">

      {/* Header */}
     <div className="">
        <h1 className="text-webapp-subsection text-bw">Dashboard</h1>
      </div>

      {/* Welcome Message */}
      <div className="mb-4 mt-4 flex flex-col">

        {/* Welcome Message */}
        <div className="flex gap-4 justify-start items-center mb-1">
         {/* Avatar */}
         <InitialsAvatar
            name={user?.name || user?.email || 'U'}
            size="lg"
            imageUrl={user?.avatar_url}
          />
          <div className="flex flex-col gap-1">
            <h2 className="text-webapp-body text-bw">
              Hallo {user?.name || 'Herzlich Willkommen'}, schön das du da bist!
            </h2>
            <p className="text-desktop-body-l text-secondary">
              Willkommen in Ihrem persönlichen Memorial Journey Dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="">
       <h3 className="text-webapp-subsection text-bw">Deine Gedenkseiten</h3>
      </div>

      {/* Invitation Card - Show if user has invitations */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h2 className="text-desktop-h3 font-semibold mb-2">
                  Sie haben {invitations.length} ausstehende Einladung{invitations.length > 1 ? 'en' : ''}
                </h2>
                <p className="text-white/90 mb-4">
                  {invitations.length === 1 
                    ? 'Sie wurden zu einer Gedenkseite eingeladen.'
                    : `Sie wurden zu ${invitations.length} Gedenkseiten eingeladen.`
                  }
                </p>
                
                <div className="space-y-2 mb-4">
                  {invitations.slice(0, 2).map((invitation) => {
                    const memorial = invitation.memorials as any | null;
                    const memorialName = memorial ? formatFullName(memorial) : '';
                    return (
                      <div key={invitation.id} className="text-white/90 text-desktop-body-s">
                        • Gedenkseite{memorialName ? ` von ${memorialName}` : ''}
                      </div>
                    );
                  })}
                  {invitations.length > 2 && (
                    <div className="text-white/90 text-desktop-body-s">
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

      {/* Main Content - Memorial Cards Grid */}
      <div className="">
        {error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Add Memorial Card - Always first */}
            <AddMemorialCard
              title="Gedenkseite hinzufügen"
              onClick={handleCreateMemorial}
            />

            {/* Memorial Cards */}
            {memorials.map((memorial) => (
              <MemorialCard
                key={memorial.id}
                memorial={{
                  id: memorial.id,
                  type: memorial.type as 'person' | 'pet' | 'tier',
                  first_name: memorial.first_name,
                  last_name: memorial.last_name,
                  avatar_type: memorial.avatar_type as 'initials' | 'icon' | 'image',
                  avatar_url: memorial.avatar_url,
                  privacy_level: memorial.privacy_level as 'public' | 'private',
                }}
                visitorCount={memorial.view_count || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}