'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { user, hasPassword, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSave = async () => {
    setLoading(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSuccess(true)
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handlePasswordSetup = async () => {
    // Reset states
    setPasswordError('')
    setPasswordSuccess(false)

    // Validate inputs
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein.')
      return
    }

    setPasswordLoading(true)

    try {
      // Use Supabase client to update password
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Update password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (authError) throw authError

      // Update has_password flag in users table
      if (user?.id) {
        const { error: dbError } = await supabase
          .from('users')
          .update({ has_password: true })
          .eq('id', user.id)

        if (dbError) {
          console.error('Error updating has_password flag:', dbError)
          // Don't throw - password is already set in auth
        }
      }

      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')

      // Refresh user data to update hasPassword status
      await refreshUser()

      setTimeout(() => setPasswordSuccess(false), 5000)
    } catch (error) {
      console.error('Password setup error:', error)
      setPasswordError('Fehler beim Einrichten des Passworts. Bitte versuchen Sie es erneut.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-desktop-h2 font-semibold text-primary mb-2">
          Kontoeinstellungen
        </h1>
        <p className="text-desktop-body-m text-secondary">
          Verwalten Sie Ihre persönlichen Daten und Kontoeinstellungen.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-background-interactive-positive-subtle border border-border-positive rounded-xs">
          <p className="text-desktop-body-s text-interactive-positive-default">
            Einstellungen erfolgreich gespeichert.
          </p>
        </div>
      )}

      <div className="bg-bw rounded-lg border border-border-subtle p-6 space-y-6">
        {/* Profile Section */}
        <div>
          <h2 className="text-desktop-h3 font-semibold text-primary mb-4">
            Profil
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-desktop-body-m font-medium text-primary mb-2">
                Vollständiger Name
              </label>
              <Input
                type="text"
                defaultValue={user?.name || ''}
                placeholder="Ihr vollständiger Name"
              />
            </div>

            <div>
              <label className="block text-desktop-body-m font-medium text-primary mb-2">
                E-Mail-Adresse
              </label>
              <Input
                type="email"
                defaultValue={user?.email || ''}
                disabled
                className="bg-secondary"
              />
              <p className="text-desktop-body-xs text-tertiary mt-1">
                Die E-Mail-Adresse kann nicht geändert werden.
              </p>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="border-t border-border-subtle pt-6">
          <h2 className="text-desktop-h3 font-semibold text-primary mb-4">
            Darstellung
          </h2>

          <div>
            <label className="block text-desktop-body-m font-medium text-primary mb-2">
              Design-Theme
            </label>
            <select
              className="w-full px-3 py-2 border border-main rounded-xs bg-bw text-primary focus:outline-none focus:ring-2 focus:ring-background-interactive-primary-default"
              value={theme || 'system'}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="system">System (Automatisch)</option>
              <option value="light">Hell</option>
              <option value="dark">Dunkel</option>
            </select>
          </div>
        </div>

        {/* Password/2FA Settings */}
        <div className="border-t border-border-subtle pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-desktop-h3 font-semibold text-primary">
                Sicherheit & Passwort
              </h2>
              <p className="text-desktop-body-s text-secondary mt-1">
                {hasPassword
                  ? 'Sie haben bereits ein Passwort eingerichtet. Sie können sich mit E-Mail und Passwort oder per Magic Link anmelden.'
                  : 'Richten Sie ein Passwort ein, um Ihr Konto zusätzlich zu schützen (2-Faktor-Authentifizierung). Sie können sich weiterhin per Magic Link anmelden.'}
              </p>
            </div>
            {hasPassword && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-desktop-body-xs font-medium">Eingerichtet</span>
              </div>
            )}
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-4 bg-background-interactive-positive-subtle border border-border-positive rounded-xs">
              <p className="text-desktop-body-s text-interactive-positive-default">
                {hasPassword ? 'Passwort erfolgreich aktualisiert.' : 'Passwort erfolgreich eingerichtet. Sie können sich jetzt mit E-Mail und Passwort anmelden.'}
              </p>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-4 bg-background-interactive-error-subtle border border-border-error rounded-xs">
              <p className="text-desktop-body-s text-interactive-error-default">
                {passwordError}
              </p>
            </div>
          )}

          {!hasPassword && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xs">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-desktop-body-s font-medium text-yellow-800 dark:text-yellow-300">
                    Sicherheitshinweis
                  </p>
                  <p className="text-desktop-body-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    Erhöhen Sie die Sicherheit Ihres Kontos, indem Sie ein Passwort einrichten. Dies bietet zusätzlichen Schutz neben der Magic-Link-Authentifizierung.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-desktop-body-m font-medium text-primary mb-2">
                {hasPassword ? 'Neues Passwort' : 'Passwort'}
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mindestens 8 Zeichen"
              />
              <p className="text-desktop-body-xs text-tertiary mt-1">
                Wählen Sie ein sicheres Passwort mit mindestens 8 Zeichen.
              </p>
            </div>

            <div>
              <label className="block text-desktop-body-m font-medium text-primary mb-2">
                Passwort bestätigen
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort wiederholen"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handlePasswordSetup}
              loading={passwordLoading}
              disabled={!newPassword || !confirmPassword}
            >
              {hasPassword ? 'Passwort aktualisieren' : 'Passwort einrichten'}
            </Button>
          </div>
        </div>

        {/* Account Type */}
        <div className="border-t border-border-subtle pt-6">
          <h2 className="text-desktop-h3 font-semibold text-primary mb-4">
            Kontotyp
          </h2>
          
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xs">
            <div>
              <p className="text-desktop-body-m font-medium text-primary">
                Kostenloser Account
              </p>
              <p className="text-desktop-body-s text-secondary">
                Grundfunktionen für Gedenkseiten
              </p>
            </div>
            <Button variant="primary" size="sm">
              Upgrade
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t border-border-subtle pt-6">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            loading={loading}
          >
            Änderungen speichern
          </Button>
        </div>
      </div>
    </div>
  )
}