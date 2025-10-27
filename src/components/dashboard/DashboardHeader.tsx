'use client'

import { useAuth } from '@/contexts/AuthContext'
import { IconButton } from '@/components/ui/Button'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
            variant="secondary"
            size="md"
            onClick={() => setShowNotifications(!showNotifications)}
            icon={
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {hasNotifications && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-interactive-error-default rounded-full border-2 border-background-bw" />
                )}
              </div>
            }
            label="Benachrichtigungen"
          />

          {/* Notifications Modal */}
          {showNotifications && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="max-w-[611px] w-full mx-4 p-3 rounded-lg backdrop-blur-xl"
                style={{ boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)' }}
              >
                <div className="rounded-[1rem] overflow-hidden p-3 bg-primary inline-flex flex-col justify-start items-start gap-6 w-full">
                  {/* Schließen Button */}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="justify-center p-1 text-secondary text-xs tracking-tight hover:text-primary transition-colors"
                  >
                    Schließen
                  </button>

                  {/* Haupttext */}
                  <div className="self-stretch justify-center text-primary">
                    <h5>Benachrichtigungen</h5>
                  </div>

                  {/* Benachrichtigungen Liste */}
                  <div className="self-stretch max-h-96 overflow-y-auto">
                    {invitations.length > 0 ? (
                      <div className="space-y-3">
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

                  {/* Alle als gelesen markieren */}
                  {invitations.length > 0 && (
                    <div className="w-full flex justify-center pt-6">
                      <button
                        className="text-desktop-body-s text-background-interactive-primary-default hover:underline"
                        onClick={() => setShowNotifications(false)}
                      >
                        Alle als gelesen markieren
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}