'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'

interface CookieConsent {
  analytics: boolean
  necessary: boolean
}

interface CookieSettingsDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function CookieSettingsDropdown({ isOpen }: CookieSettingsDropdownProps) {
  const [consent, setConsent] = useState<CookieConsent>({
    analytics: false,
    necessary: true,
  })

  // Load existing consent from localStorage
  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent')
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        setConsent(parsed)
      } catch (e) {
        console.error('Failed to parse cookie consent', e)
      }
    }
  }, [])

  // Auto-save on analytics toggle
  const handleAnalyticsSwitch = (checked: boolean) => {
    const updated = { ...consent, analytics: checked }
    setConsent(updated)
    localStorage.setItem('cookie-consent', JSON.stringify(updated))

    // Trigger analytics consent event if applicable
    if (checked && typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ event: 'analytics_consent_granted' })
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="absolute right-0 top-full mt-2 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="p-3 rounded-lg backdrop-blur-xl"
        style={{ boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)' }}
      >
        <div className="rounded-[1rem] overflow-hidden p-4 bg-primary inline-flex flex-col justify-start items-start gap-4 w-full">
          {/* Notwendige Cookies */}
          <div className="w-full inline-flex justify-between items-center">
            <div>
              <div className="justify-center text-primary text-body-s-semibold w-[20rem] mr-1">
                Notwendige Cookies
              </div>
              <div className="justify-center text-secondary text-xs">
                Essentiell damit die Seiten funktionieren. Immer an.
              </div>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} disabled variant="cookie" />
          </div>

          {/* Analyse Cookies */}
          <div className="w-full inline-flex justify-between items-center">
            <div>
              <div className="justify-center text-primary text-body-s-semibold w-[20rem] mr-1">
                Analyse Cookies
              </div>
              <div className="justify-center text-secondary text-xs">
                Werden zur Messung der Nutzung erhoben,
                <br />
                um das Erlebnis zu verbessern.
              </div>
            </div>
            <Switch
              checked={consent.analytics}
              onCheckedChange={handleAnalyticsSwitch}
              variant="cookie"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>
  }
}
