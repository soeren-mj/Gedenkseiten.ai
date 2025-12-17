'use client'

import { useState } from 'react'
import { TextInput } from '@/components/ui/text-input'
import { Button } from '@/components/ui/Button'
import { XIcon } from '@/components/icons/XIcon'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import PersonIcon from '@/components/icons/PersonIcon'
import AnimalIcon from '@/components/icons/AnimalIcon'
import type { Memorial } from '@/lib/supabase'

interface MemorialDeletionModalProps {
  isOpen: boolean
  memorial: Memorial
  onClose: () => void
  onConfirm: (nameConfirmation: string) => Promise<void>
}

export function MemorialDeletionModal({
  isOpen,
  memorial,
  onClose,
  onConfirm,
}: MemorialDeletionModalProps) {
  const [nameConfirmation, setNameConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Build expected name (first_name + last_name if exists)
  const expectedName = `${memorial.first_name}${memorial.last_name ? ' ' + memorial.last_name : ''}`.trim()

  // Name validation - must match exactly
  const nameMatches = nameConfirmation === expectedName

  const handleSubmit = async () => {
    // Reset error
    setError('')

    // Validate name matches exactly
    if (!nameConfirmation.trim()) {
      setError('Bitte gib den Namen ein')
      return
    }

    if (nameConfirmation !== expectedName) {
      setError('Der eingegebene Name stimmt nicht mit dem Namen der Gedenkseite überein')
      return
    }

    // Submit
    setIsLoading(true)
    try {
      await onConfirm(nameConfirmation)
      // Success handled by parent component (redirect to dashboard)
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

    setNameConfirmation('')
    setError('')
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
            <XIcon variant="sm" className="w-5 h-5 text-primary" />
          </button>
        )}

        {/* Modal content */}
        <div className="rounded-xs p-4 bg-primary inline-flex flex-col gap-4 max-w-[36rem] items-center">
          {/* Loading overlay during deletion */}
          {isLoading && (
            <div className="absolute inset-0 bg-bw/50 rounded-xs flex items-center justify-center z-10">
              <div className="text-center bg-primary p-6 rounded-xs">
                <div className="w-12 h-12 border-4 border-accent-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-webapp-body text-primary mb-2">Gedenkseite wird gelöscht...</p>
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
              Möchtest du wirklich diese Gedenkseite dauerhaft und unwiderruflich löschen?
            </h2>

            {/* Warning Text */}
            <p className="text-body-m text-secondary text-center">
              Diese Aktion kann nicht rückgängig gemacht werden. Die Gedenkseite und alle
              zugehörigen Inhalte werden dauerhaft gelöscht: Beiträge, Kondolenzeinträge,
              Reaktionen und Einladungen.
            </p>
          </div>

          {/* Memorial Summary Card */}
          <div className="w-full p-4 rounded-xs bg-secondary border border-main">
            <div className="flex items-center gap-3">
              <InitialsAvatar
                name={expectedName}
                size="md"
                imageUrl={memorial.avatar_url}
              />
              <div className="flex-1">
                <p className="text-webapp-group text-primary">
                  {expectedName}
                </p>
                <div className="flex items-center gap-1 text-tertiary text-body-s">
                  {memorial.type === 'person' ? (
                    <>
                      <PersonIcon className="w-4 h-4" />
                      <span>Person</span>
                    </>
                  ) : (
                    <>
                      <AnimalIcon className="w-4 h-4" />
                      <span>Tier</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Name Confirmation Input */}
          <div className="w-full">
            <p className="text-body-s text-secondary mb-2">
              Bitte gib zur Bestätigung den Namen ein: <strong>{expectedName}</strong>
            </p>
            <TextInput
              placeholder={expectedName}
              value={nameConfirmation}
              onChange={setNameConfirmation}
              error={error}
              disabled={isLoading}
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
              disabled={isLoading || !nameMatches}
              className="flex-1"
            >
              Gedenkseite unwiderruflich löschen
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
