'use client'

import { useState, useEffect } from 'react'
import { TextInput } from '@/components/ui/text-input'
import { Button } from '@/components/ui/Button'
import { XIcon } from '@/components/icons/XIcon'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { createClient } from '@/lib/supabase/client'

interface DeletionSummary {
  memorialCount: number
  totalPosts: number
  contributionCount: number
}

interface AccountDeletionModalProps {
  isOpen: boolean
  userEmail: string
  userName: string | null
  userAvatar: string | null
  accountType: 'free' | 'premium'
  onClose: () => void
  onConfirm: (emailConfirmation: string) => Promise<void>
}

export function AccountDeletionModal({
  isOpen,
  userEmail,
  userName,
  userAvatar,
  accountType,
  onClose,
  onConfirm,
}: AccountDeletionModalProps) {
  const [emailConfirmation, setEmailConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [deletionSummary, setDeletionSummary] = useState<DeletionSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  // Email validation - must match exactly
  const emailMatches = emailConfirmation === userEmail

  // Fetch deletion summary when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDeletionSummary()
    }
  }, [isOpen])

  const fetchDeletionSummary = async () => {
    setLoadingSummary(true)
    try {
      // Get auth token from Supabase session
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/user/deletion-summary', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch deletion summary')
      }
      const data = await response.json()
      setDeletionSummary(data)
    } catch (err) {
      console.error('Failed to fetch deletion summary:', err)
      // Set defaults if fetch fails
      setDeletionSummary({
        memorialCount: 0,
        totalPosts: 0,
        contributionCount: 0,
      })
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleSubmit = async () => {
    // Reset error
    setError('')

    // Validate email matches exactly
    if (!emailConfirmation.trim()) {
      setError('Bitte gib deine E-Mail-Adresse ein')
      return
    }

    if (emailConfirmation !== userEmail) {
      setError('Die eingegebene E-Mail-Adresse stimmt nicht mit deiner aktuellen E-Mail-Adresse überein')
      return
    }

    // Submit
    setIsLoading(true)
    try {
      await onConfirm(emailConfirmation)
      // Success handled by parent component (redirect to login)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut')
      }
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Prevent closing during deletion
    if (isLoading) {
      return
    }

    setEmailConfirmation('')
    setError('')
    setDeletionSummary(null)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent closing during deletion
    if (isLoading) {
      return
    }

    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bw-opacity-40 backdrop-blur-xl"
      onClick={handleBackdropClick}
    >
      <div
        className="p-3 rounded-md backdrop-blur-xl"
        style={{ boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)' }}
      >
        {/* Close button - hidden during deletion */}
        {!isLoading && (
          <button
            onClick={handleClose}
            className="absolute bg-primary right-1 top-1 p-1 rounded-xs hover:bg-secondary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue"
            aria-label="Schließen"
          >
            <XIcon variant="md" className="w-5 h-5 text-primary" />
          </button>
        )}

        {/* Modal content */}
        <div className="rounded-xs p-4 bg-primary inline-flex flex-col gap-4 max-w-[36rem] items-center">
          {/* Loading overlay during deletion */}
          {isLoading && (
            <div className="absolute inset-0 bg-bw/50 rounded-xs flex items-center justify-center z-10">
              <div className="text-center bg-primary p-6 rounded-xs">
                <div className="w-12 h-12 border-4 border-accent-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-webapp-body text-primary mb-2">Konto wird gelöscht...</p>
                <p className="text-body-xs text-tertiary">
                  Bitte schließe dieses Fenster nicht
                </p>
              </div>
            </div>
          )}

          <div className="w-full inline-flex flex-col gap-3 items-center">
            {/* Warning Icon */}
            <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-accent-red"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-webapp-subsection text-bw text-center">
              Möchtest du wirklich dein gesamtes Konto dauerhaft und unwiderruflich löschen?
            </h2>

            {/* Warning Text */}
            <p className="text-body-m text-secondary text-center">
              Diese Aktion kann nicht rückgängig gemacht werden. Dein komplettes Konto wird gelöscht
              und alle Seiten die du hauptverantwortlich führst. Zudem werden alle deine Einträge und
              Beiträge gelöscht.
            </p>
          </div>

          {/* User Summary Card */}
          <div className="w-full p-4 rounded-xs bg-secondary border border-main">
            <div className="flex items-center gap-3">
              <InitialsAvatar
                name={userName || userEmail}
                size="md"
                imageUrl={userAvatar}
              />
              <div className="flex-1">
                <p className="text-webapp-group text-primary">
                  {userName || userEmail.split('@')[0]}
                </p>
                <p className="text-body-s text-tertiary">
                  {accountType === 'premium' ? 'Premium Account' : 'Kostenfreier Account'}
                </p>
              </div>
              <div className="text-right">
                {loadingSummary ? (
                  <div className="w-4 h-4 border-2 border-tertiary border-t-transparent rounded-full animate-spin"></div>
                ) : deletionSummary ? (
                  <p className="text-body-s text-primary">
                    {deletionSummary.memorialCount} Gedenkseite
                    {deletionSummary.memorialCount !== 1 ? 'n' : ''} •{' '}
                    {deletionSummary.totalPosts} Beiträge
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Email Confirmation Input */}
          <div className="w-full">
            <p className="text-body-s text-secondary mb-2">
              Bitte gibt deine E-Mail-Adresse ein, um die Löschung zu bestätigen
            </p>
            <TextInput
              placeholder={userEmail}
              value={emailConfirmation}
              onChange={setEmailConfirmation}
              error={error}
              disabled={isLoading}
              type="email"
              autoComplete="off"
            />
          </div>

          {/* Action Buttons */}
          <div className="w-full inline-flex flex-col gap-3">
            <Button
              variant="negative"
              size="lg"
              onClick={handleSubmit}
              loading={isLoading}
              disabled={isLoading || !emailMatches}
              className="flex-1"
            >
              Konto unwiderruflich löschen
            </Button>
            <Button
              variant="text"
              size="xs"
              onClick={handleClose}
              disabled={isLoading}
              className=""
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
