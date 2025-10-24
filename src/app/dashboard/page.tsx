'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import AddMemorialCard from '@/components/cards/AddMemorialCard'
import InitialsAvatar from '@/components/ui/InitialsAvatar'

export default function DashboardPage() {
  const { user, invitations } = useAuth()

  // Handler for creating new memorial
  const handleCreateMemorial = () => {
    // TODO: Navigate to memorial creation flow
    console.log('Create new memorial')
  }

  return (
    <div className="mx-auto max-w-4xl gap-6 flex flex-col">
      {/* Welcome Message */}
      <div className="mb-8 mt-8">
        <div className="flex gap-4 justify-start items-center mb-2">
         {/* Avatar */}
         <InitialsAvatar
            name={user?.name || user?.email || 'U'}
            size="lg"
          />
        <h3 className="mb-2">
          Hallo {user?.name || 'Herzlich Willkommen'}, schön das du da bist!
        </h3>
        </div>
        <p className="text-desktop-body-l text-secondary">
          Willkommen in Ihrem persönlichen Memorial Journey Dashboard.
        </p>
      </div>
      <div className="">
       <h2>Deine Gedenkseiten</h2>
       
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
                  {invitations.slice(0, 2).map((invitation) => (
                    <div key={invitation.id} className="text-white/90 text-desktop-body-s">
                      • Gedenkseite von {(invitation.memorials as { first_name: string; last_name: string })?.first_name} {(invitation.memorials as { first_name: string; last_name: string })?.last_name}
                    </div>
                  ))}
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

      {/* Main Content - Empty State */}
      <div className="">
        <div className="text-center">
          {/* Add Memorial Card */}
          <div className="flex mb-6">
            <AddMemorialCard
              title="Gedenkseite hinzufügen"
              description="Erstellen Sie Ihre erste Gedenkseite, um das Andenken an einen geliebten Menschen zu bewahren."
              onClick={handleCreateMemorial}
            />
          </div>

          {/* Alternative Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-secondary rounded-lg">
              <div className="w-12 h-12 bg-background-interactive-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-background-interactive-primary-default" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-desktop-body-l font-medium text-primary mb-2">
                Gedenkseite finden
              </h3>
              <p className="text-desktop-body-s text-secondary mb-4">
                Suchen Sie nach bestehenden Gedenkseiten von Familie und Freunden.
              </p>
              <Button variant="tertiary" size="sm" fullWidth>
                Durchsuchen
              </Button>
            </div>

            <div className="p-6 bg-secondary rounded-lg">
              <div className="w-12 h-12 bg-background-interactive-positive-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-background-interactive-positive-default" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-desktop-body-l font-medium text-primary mb-2">
                Hilfe & Support
              </h3>
              <p className="text-desktop-body-s text-secondary mb-4">
                Lernen Sie, wie Sie Gedenkseiten erstellen und verwalten.
              </p>
              <Button variant="tertiary" size="sm" fullWidth>
                Anleitungen ansehen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}