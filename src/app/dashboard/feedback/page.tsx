'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      setError('Bitte gib eine Nachricht ein.')
      return
    }

    setSending(true)
    setError(null)

    try {
      // Send feedback via mailto link as a simple solution
      const subject = encodeURIComponent('Feedback zu Gedenkseiten.ai')
      const body = encodeURIComponent(message)
      window.location.href = `mailto:hello@gedenkseiten.ai?subject=${subject}&body=${body}`

      setSent(true)
      setMessage('')
    } catch (err) {
      console.error('Failed to send feedback:', err)
      setError('Feedback konnte nicht gesendet werden. Bitte versuche es erneut.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-3 pt-4">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-body-s text-tertiary hover:text-primary transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Zurück zum Dashboard</span>
      </Link>

      {/* Page Header */}
      <div className="w-full p-5 pb-7 flex flex-col gap-2">
        <h1 className="text-webapp-subsection text-primary">Feedback senden</h1>
        <p className="text-body-m text-secondary">
          Wir freuen uns über dein Feedback! Teile uns mit, was dir gefällt oder was wir verbessern können.
        </p>
      </div>

      {/* Entry Panel */}
      <div className="px-4">
        <div className="flex flex-col gap-6 p-4 border border-card rounded-xs bg-primary">
          {sent ? (
            <div className="p-5 rounded-md border bg-message-success border-message-success">
              <p className="text-body-m text-message-success">
                Vielen Dank für dein Feedback! Dein E-Mail-Programm sollte sich geöffnet haben.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextArea
                label="Deine Nachricht"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Schreibe hier dein Feedback..."
                rows={6}
                maxLength={2000}
                showCharCount
              />

              {error && (
                <p className="text-body-s text-accent-red">{error}</p>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={sending}
                  disabled={!message.trim()}
                >
                  Feedback senden
                </Button>
              </div>
            </form>
          )}

          <div className="text-body-s text-tertiary">
            <p>
              Du kannst uns auch direkt per E-Mail erreichen:{' '}
              <a
                href="mailto:hello@gedenkseiten.ai"
                className="text-interactive-primary-default underline"
              >
                hello@gedenkseiten.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
