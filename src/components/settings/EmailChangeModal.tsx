'use client'

import { useState } from 'react'
import { TextInput } from '@/components/ui/text-input'
import { Button } from '@/components/ui/Button'
import { XIcon } from '@/components/icons/XIcon'

interface EmailChangeModalProps {
  isOpen: boolean
  currentEmail: string
  onClose: () => void
  onSubmit: (newEmail: string) => Promise<void>
}

export function EmailChangeModal({ isOpen, currentEmail, onClose, onSubmit }: EmailChangeModalProps) {
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async () => {
    // Reset error
    setError('')

    // Validate email
    if (!newEmail.trim()) {
      setError('Bitte gib eine E-Mail-Adresse ein')
      return
    }

    if (!isValidEmail(newEmail)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein')
      return
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError('Die neue E-Mail-Adresse ist identisch mit der aktuellen')
      return
    }

    // Submit
    setIsLoading(true)
    try {
      await onSubmit(newEmail)
      // Success handled by parent component
      handleClose()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNewEmail('')
    setError('')
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
      <div className="p-3 rounded-md backdrop-blur-xl"
      style={{ boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)' }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute bg-primary right-1 top-1 p-1 rounded-xs hover:bg-secondary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue"
          aria-label="Schließen"
          disabled={isLoading}
        >
          <XIcon variant="md" className="w-5 h-5 text-primary" />
        </button>

        {/* Modal content */}
        <div className="rounded-xs p-4 bg-primary inline-flex flex-col gap-4 max-w-[32rem] items-center">
          <div className="w-full inline-flex flex-col gap-2 items-center">
           {/* Title */}
           <h2 className="text-webapp-subsection text-bw">
             Deine aktuelle E-Mail-Adresse ist:
           </h2>

           {/* Current Email (readonly) */}
           <div className="">
             <p className="text-body-m text-accent">
               {currentEmail}
             </p>
           </div>

           {/* Info Text */}
           <div className="">
             <p className="text-body-m text-secondary text-center">
               Gib eine neue E-Mail-Adresse ein, wenn du die Aktuelle ändern willst. Wir senden dir eine Bestätigungs-E-Mail an deine neue Adresse. Klicke auf den Link in der E-Mail, um die Änderung abzuschließen.
             </p>
           </div>
          </div>

          {/* New Email Input */}
          <div className="w-full">
            <TextInput
              label="Neue E-Mail-Adresse"
              placeholder="neue@email.de"
              value={newEmail}
              onChange={setNewEmail}
              error={error}
              disabled={isLoading}
              type="email"
              autoComplete="email"
            />
          </div>

          {/* Action Buttons */}
          <div className="w-full inline-flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              Bestätigungs-E-Mail senden
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
