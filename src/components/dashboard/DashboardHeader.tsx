'use client'

import { useAuth } from '@/contexts/AuthContext'
import { IconButton } from '@/components/ui/Button'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import BellNotificationIcon from '@/components/icons/BellNotificationIcon'

export function DashboardHeader() {
  const { invitations } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  const hasNotifications = invitations.length > 0

  return (
    <header className="px-6 py-4 w-full">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-1">
          <Image
            src="/images/logo-gedenkseiten.ai-white-x4.png"
            alt="Gedenkseiten.ai"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <span className="text-primary font-satoshi text-xl font-medium">
            Gedenkseiten.ai
          </span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <IconButton
            variant="tertiary"
            size="md"
            onClick={() => setShowNotifications(!showNotifications)}
            icon={
              <div className="relative">
                <BellNotificationIcon className="w-5 h-5" />
                {hasNotifications && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-interactive-error-default rounded-full border-2 border-background-bw" />
                )}
              </div>
            }
            label="Benachrichtigungen"
          />

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-bw border border-border-subtle rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border-subtle">
                <h3 className="text-desktop-body-m font-medium text-primary">
                  Benachrichtigungen
                </h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {invitations.length > 0 ? (
                  <div className="p-4 space-y-3">
                    {invitations.map((invitation) => (
                      <div 
                        key={invitation.id}
                        className="p-3 bg-secondary rounded-xs border border-border-subtle"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-interactive-primary-default rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-interactive-default" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-desktop-body-s font-medium text-primary">
                              Einladung zur Gedenkseite
                            </p>
                            <p className="text-desktop-body-xs text-secondary">
                              Sie wurden zur Gedenkseite von{' '}
                              {(invitation.memorials as { first_name: string; last_name: string })?.first_name} {(invitation.memorials as { first_name: string; last_name: string })?.last_name} eingeladen.
                            </p>
                            <p className="text-desktop-body-xs text-tertiary mt-1">
                              Rolle: {invitation.role === 'administrator' ? 'Administrator' : 'Mitglied'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 mx-auto text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-desktop-body-s text-tertiary">
                      Keine neuen Benachrichtigungen
                    </p>
                  </div>
                )}
              </div>
              
              {invitations.length > 0 && (
                <div className="p-4 border-t border-border-subtle">
                  <button className="text-desktop-body-s text-background-interactive-primary-default hover:underline">
                    Alle als gelesen markieren
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}