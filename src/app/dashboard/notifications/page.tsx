'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { useState } from 'react'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState({
    memorial_activity: user?.notification_preferences?.memorial_activity ?? true,
    moderation_required: user?.notification_preferences?.moderation_required ?? true,
    reminders: user?.notification_preferences?.reminders ?? true,
    new_features: user?.notification_preferences?.new_features ?? true,
  })

  const handleSave = async () => {
    setLoading(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSuccess(true)
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-desktop-h2 font-semibold text-primary mb-2">
          Benachrichtigungen
        </h1>
        <p className="text-desktop-body-m text-secondary">
          Verwalten Sie Ihre E-Mail-Benachrichtigungen und Erinnerungen.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-background-interactive-positive-subtle border border-border-positive rounded-xs">
          <p className="text-desktop-body-s text-interactive-positive-default">
            Benachrichtigungseinstellungen erfolgreich gespeichert.
          </p>
        </div>
      )}

      <div className="bg-bw rounded-lg border border-border-subtle p-6 space-y-6">
        {/* Email Notifications */}
        <div>
          <h2 className="text-desktop-h3 font-semibold text-primary mb-4">
            E-Mail-Benachrichtigungen
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="memorial_activity"
                checked={settings.memorial_activity}
                onChange={() => handleToggle('memorial_activity')}
              />
              <div className="flex-1">
                <label 
                  htmlFor="memorial_activity"
                  className="text-desktop-body-m font-medium text-primary cursor-pointer"
                >
                  Gedenkseiten-Aktivitäten
                </label>
                <p className="text-desktop-body-s text-secondary">
                  Neue Beiträge, Kondolenzen und Reaktionen auf Gedenkseiten, an denen Sie beteiligt sind.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="moderation_required"
                checked={settings.moderation_required}
                onChange={() => handleToggle('moderation_required')}
              />
              <div className="flex-1">
                <label 
                  htmlFor="moderation_required"
                  className="text-desktop-body-m font-medium text-primary cursor-pointer"
                >
                  Moderation erforderlich
                </label>
                <p className="text-desktop-body-s text-secondary">
                  Benachrichtigungen, wenn Inhalte Ihre Genehmigung benötigen.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="reminders"
                checked={settings.reminders}
                onChange={() => handleToggle('reminders')}
              />
              <div className="flex-1">
                <label 
                  htmlFor="reminders"
                  className="text-desktop-body-m font-medium text-primary cursor-pointer"
                >
                  Erinnerungen
                </label>
                <p className="text-desktop-body-s text-secondary">
                  Jahrestage, Geburtstage und andere wichtige Termine.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="new_features"
                checked={settings.new_features}
                onChange={() => handleToggle('new_features')}
              />
              <div className="flex-1">
                <label 
                  htmlFor="new_features"
                  className="text-desktop-body-m font-medium text-primary cursor-pointer"
                >
                  Neue Funktionen
                </label>
                <p className="text-desktop-body-s text-secondary">
                  Updates über neue Features und Verbesserungen der Plattform.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="border-t border-border-subtle pt-6">
          <h2 className="text-desktop-h3 font-semibold text-primary mb-4">
            Benachrichtigungsfrequenz
          </h2>
          
          <div>
            <label className="block text-desktop-body-m font-medium text-primary mb-2">
              Zusammenfassung
            </label>
            <select className="w-full px-3 py-2 border border-main rounded-xs bg-bw text-primary focus:outline-none focus:ring-2 focus:ring-background-interactive-primary-default">
              <option value="immediate">Sofort</option>
              <option value="daily">Täglich</option>
              <option value="weekly">Wöchentlich</option>
              <option value="never">Nie</option>
            </select>
            <p className="text-desktop-body-xs text-secondary mt-1">
              Wie oft möchten Sie Benachrichtigungen über Aktivitäten erhalten?
            </p>
          </div>
        </div>

        {/* Do Not Disturb */}
        <div className="border-t border-border-subtle pt-6">
          <h2 className="text-desktop-h3 font-semibold text-primary mb-4">
            Ruhemodus
          </h2>
          
          <div className="p-4 bg-secondary rounded-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-desktop-body-m font-medium text-primary">
                  Alle Benachrichtigungen pausieren
                </p>
                <p className="text-desktop-body-s text-secondary">
                  Vorübergehend alle E-Mail-Benachrichtigungen deaktivieren
                </p>
              </div>
              <Checkbox
                id="do_not_disturb"
                checked={false}
                onChange={() => {}}
              />
            </div>
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
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </div>
  )
}