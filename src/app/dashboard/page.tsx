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
    <div className="mx-auto max-w-4xl gap-8 flex flex-col">

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
              
              onClick={handleCreateMemorial}
            />
          </div>
        </div>
      </div>
    </div>
  )
}