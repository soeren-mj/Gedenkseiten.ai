'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSuccess(true)
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
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