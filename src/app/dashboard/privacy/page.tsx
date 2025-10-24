'use client'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { useState } from 'react'

export default function PrivacyPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSuccess(true)
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleDeleteAccount = async () => {
    // This would handle account deletion
    setShowDeleteConfirm(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-desktop-h2 font-semibold text-primary mb-2">
          Privatsphäre & Sicherheit
        </h1>
        <p className="text-desktop-body-m text-secondary">
          Verwalten Sie Ihre Datenschutzeinstellungen und Kontosicherheit.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-background-interactive-positive-subtle border border-border-positive rounded-xs">
          <p className="text-desktop-body-s text-interactive-positive-default">
            Datenschutzeinstellungen erfolgreich gespeichert.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Privacy Settings */}
        <div className="bg-bw rounded-lg border border-border-subtle p-6">
          <h2 className="text-desktop-h3 font-semibold text-primary mb-4">
            Datenschutzeinstellungen
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="profile_visibility"
                defaultChecked={true}
              />
              <div className="flex-1">
                <label 
                  htmlFor="profile_visibility"
                  className="text-desktop-body-m font-medium text-primary cursor-pointer"
                >
                  Profil öffentlich sichtbar
                </label>
                <p className="text-desktop-body-s text-secondary">
                  Andere Benutzer können Ihr Profil in Suchergebnissen finden.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="activity_visibility"
                defaultChecked={false}
              />
              <div className="flex-1">
                <label 
                  htmlFor="activity_visibility"
                  className="text-desktop-body-m font-medium text-primary cursor-pointer"
                >
                  Aktivitäten anzeigen
                </label>
                <p className="text-desktop-body-s text-secondary">
                  Zeigen Sie Ihre Aktivitäten auf Gedenkseiten anderen Benutzern.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="analytics_consent"
                defaultChecked={true}
              />
              <div className="flex-1">
                <label 
                  htmlFor="analytics_consent"
                  className="text-desktop-body-m font-medium text-primary cursor-pointer"
                >
                  Analyse-Cookies
                </label>
                <p className="text-desktop-body-s text-secondary">
                  Helfen Sie uns, die Plattform durch anonyme Nutzungsdaten zu verbessern.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
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

        {/* Data Export */}
        <div className="bg-bw rounded-lg border border-border-subtle p-6">
          <h2 className="text-desktop-h3 font-semibold text-primary mb-4">
            Daten exportieren
          </h2>
          
          <p className="text-desktop-body-m text-secondary mb-4">
            Laden Sie eine Kopie Ihrer Daten herunter, einschließlich Profilinformationen, 
            Gedenkseiten und Beiträge.
          </p>

          <Button variant="secondary" size="md">
            Datenexport anfordern
          </Button>
        </div>

        {/* Account Deletion */}
        <div className="bg-bw rounded-lg border border-border-error p-6">
          <h2 className="text-desktop-h3 font-semibold text-foreground-error mb-4">
            Konto löschen
          </h2>
          
          <p className="text-desktop-body-m text-secondary mb-4">
            Das Löschen Ihres Kontos ist dauerhaft und kann nicht rückgängig gemacht werden. 
            Alle Ihre Gedenkseiten und Daten werden unwiderruflich gelöscht.
          </p>

          {showDeleteConfirm ? (
            <div className="space-y-4">
              <div className="p-4 bg-background-interactive-error-subtle rounded-xs">
                <p className="text-desktop-body-s text-foreground-error font-medium mb-2">
                  Sind Sie sicher, dass Sie Ihr Konto löschen möchten?
                </p>
                <p className="text-desktop-body-xs text-secondary">
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="negative"
                  size="md"
                  onClick={handleDeleteAccount}
                >
                  Ja, Konto löschen
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="negative"
              size="md"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Konto löschen
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}