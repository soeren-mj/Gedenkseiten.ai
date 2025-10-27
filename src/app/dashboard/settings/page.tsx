'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { NameInput } from '@/components/ui/NameInput'
import { Switch } from '@/components/ui/switch'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { user, updateUserName } = useAuth()
  const { theme, setTheme } = useTheme()
  const [darkMode, setDarkMode] = useState(theme === 'dark')
  const [userName, setUserName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState({
    activities: true,
    releases: true,
    reminders: true,
    features: true
  })

  // Initialize userName from user data
  useEffect(() => {
    if (user?.name) {
      setUserName(user.name)
    }
  }, [user?.name])

  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked)
    setTheme(checked ? 'dark' : 'light')
  }

  const handleCookieSettings = () => {
    // TODO: Open cookie settings modal
    console.log('Open cookie settings modal')
  }

  const handleSupportClick = () => {
    // TODO: Open support modal
    console.log('Open support modal')
  }

  const handleNameSave = async (name: string) => {
    setSavingName(true)
    try {
      await updateUserName(name || null)
    } catch (error) {
      console.error('Failed to update name:', error)
      // Optionally show error message to user
    } finally {
      setSavingName(false)
    }
  }

  return (
    <div className="max-w-4xl gap-6 flex flex-col bg-bw-opacity-60 p-8 mx-auto">
      {/* Header with Avatar and Name */}
      <div className="gap-3">
        <h2 className="text-webapp-group mb-1">Einstellungen</h2>
        <div className="border-b border-main"></div>

        <div className="flex gap-4 items-center mb-6">
          <InitialsAvatar
            name={user?.name || user?.email || 'U'}
            size="lg"
          />
          <div className="flex-1">
            <NameInput
              value={userName}
              onChange={setUserName}
              onSave={handleNameSave}
              loading={savingName}
              label="Name"
              placeholder="Gib deinen Namen ein"
            />
          </div>
        </div>
      </div>

      {/* Zugriffseinstellungen Section */}
      <div className="mb-8">
        <h2 className="text-webapp-group mb-3">Zugriffseinstellungen</h2>
        <div className="border-b border-main mb-6"></div>

        <div className="space-y-6">
          {/* E-Mail-Adresse */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-primary text-desktop-body-m font-medium mb-1">
                E-Mail-Adresse
              </p>
              <p className="text-tertiary text-desktop-body-s">
                {user?.email || 'peter.williams@guugleemails.com'}
              </p>
            </div>
            <Button variant="tertiary" size="sm">
              E-Mail-Adresse ändern
            </Button>
          </div>

          {/* Passwort */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-primary text-desktop-body-m font-medium mb-1">
                Passwort
              </p>
              <p className="text-tertiary text-desktop-body-s">
                Wähle ein sicheres Passwort um dich einzuloggen
              </p>
            </div>
            <Button variant="tertiary" size="sm">
              Passwort ändern
            </Button>
          </div>
        </div>
      </div>

      {/* Privatsphäre Section */}
      <div className="mb-8">
        <h2 className="text-webapp-group mb-3">Privatsphäre</h2>
        <div className="border-b border-main mb-6"></div>

        <div
          className="flex items-center justify-between p-4 bg-bw rounded-sm border border-border-subtle cursor-pointer hover:bg-secondary transition-colors"
          onClick={handleCookieSettings}
        >
          <div className="flex-1">
            <p className="text-primary text-desktop-body-m mb-1">
              Cookie Einstellungen
            </p>
            <p className="text-tertiary text-desktop-body-s">
              Stelle deine Cookies ein. Mehr Details findest du in den{' '}
              <a
                href="/datenschutz"
                className="text-interactive-primary-default underline"
                onClick={(e) => e.stopPropagation()}
              >
                Datenschutzbestimmungen
              </a>
              .
            </p>
          </div>
          <svg
            className="w-5 h-5 text-tertiary flex-shrink-0 ml-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* E-Mail-Benachrichtigungen Section */}
      <div className="mb-8">
        <h2 className="text-webapp-group mb-3">E-Mail-Benachrichtigungen</h2>
        <div className="border-b border-main mb-6"></div>

        <div className="space-y-4">
          {/* Aktivitäten */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-primary text-desktop-body-m font-medium mb-1">
                Aktivitäten auf deinen Gedenkseiten
              </p>
              <p className="text-tertiary text-desktop-body-s">
                Erhalte E-Mails über neue Einträge, Verknüpfungsanfragen, Kontaktanfragen
              </p>
            </div>
            <Switch
              checked={emailNotifications.activities}
              onCheckedChange={(checked) =>
                setEmailNotifications(prev => ({ ...prev, activities: checked }))
              }
            />
          </div>

          {/* Freigaben */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-primary text-desktop-body-m font-medium mb-1">
                Freigaben
              </p>
              <p className="text-tertiary text-desktop-body-s">
                Erhalte E-Mails über Einträge die noch von dir freizugeben sind
              </p>
            </div>
            <Switch
              checked={emailNotifications.releases}
              onCheckedChange={(checked) =>
                setEmailNotifications(prev => ({ ...prev, releases: checked }))
              }
            />
          </div>

          {/* Erinnerungen */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-primary text-desktop-body-m font-medium mb-1">
                Erinnerungen
              </p>
              <p className="text-tertiary text-desktop-body-s">
                Erhalte E-Mails über Erinnerungen zu Terminen und Jahrestagen
              </p>
            </div>
            <Switch
              checked={emailNotifications.reminders}
              onCheckedChange={(checked) =>
                setEmailNotifications(prev => ({ ...prev, reminders: checked }))
              }
            />
          </div>

          {/* Neue Funktionen */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-primary text-desktop-body-m font-medium mb-1">
                Neue Funktionen
              </p>
              <p className="text-tertiary text-desktop-body-s">
                Erhalte E-Mails über neue Funktionen
              </p>
            </div>
            <Switch
              checked={emailNotifications.features}
              onCheckedChange={(checked) =>
                setEmailNotifications(prev => ({ ...prev, features: checked }))
              }
            />
          </div>
        </div>
      </div>

      {/* Darstellung Section */}
      <div className="mb-8">
        <h2 className="text-webapp-group mb-3">Darstellung</h2>
        <div className="border-b border-main mb-6"></div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-primary text-desktop-body-m font-medium mb-1">
              Dark Mode
            </p>
            <p className="text-tertiary text-desktop-body-s">
              Die Darstellung wird anhand der Browser-Einstellung gewählt. Die Standard-Einstellung ist Light Mode. Du kannst die Einstellung hier nach belieben anpassen.
            </p>
          </div>
          <Switch
            checked={darkMode}
            onCheckedChange={handleThemeToggle}
          />
        </div>
      </div>

      {/* Support Section */}
      <div className="mb-8">
        <h2 className="text-webapp-group mb-3">Support</h2>
        <div className="border-b border-main mb-6"></div>

        <div
          className="flex items-center justify-between p-4 bg-bw rounded-sm border border-border-subtle cursor-pointer hover:bg-secondary transition-colors"
          onClick={handleSupportClick}
        >
          <div className="flex-1">
            <p className="text-primary text-desktop-body-m mb-1">
              Konto-ID
            </p>
            <p className="text-tertiary text-desktop-body-s font-mono">
              {user?.id || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'}
            </p>
          </div>
          <svg
            className="w-5 h-5 text-tertiary flex-shrink-0 ml-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}