'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import AddMemorialCard from '@/components/cards/AddMemorialCard'
import ActionCard from '@/components/cards/ActionCard'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { SearchIcon } from '@/components/icons/SearchIcon'
import HelpLibraryIcon from '@/components/icons/HelpLibraryIcon'

export default function DashboardPage() {
  const { user, invitations } = useAuth()

  // Handler for creating new memorial
  const handleCreateMemorial = () => {
    // TODO: Navigate to memorial creation flow
    console.log('Create new memorial')
  }

  // Handler for searching memorials
  const handleSearchMemorials = () => {
    // TODO: Navigate to search page
    console.log('Search memorials')
  }

  // Handler for help & support
  const handleHelpSupport = () => {
    // TODO: Navigate to help page
    console.log('Open help & support')
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
        <h3 className="">
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
            <ActionCard
              icon={<SearchIcon className="w-6 h-6" />}
              title="Gedenkseite finden"
              description="Suchen Sie nach bestehenden Gedenkseiten von Familie und Freunden."
              onClick={handleSearchMemorials}
              variant="secondary"
            />

            <ActionCard
              icon={<HelpLibraryIcon className="w-11 h-11" />}
              title="Hilfe & Support"
              description="Lernen Sie, wie Sie Gedenkseiten erstellen und verwalten."
              onClick={handleHelpSupport}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}