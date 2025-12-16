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

// Helper functions for cookie management (same as CookieBanner)
const COOKIE_NAME = 'cookie-consent'
const COOKIE_MAX_AGE = 15768000 // 6 months in seconds (DSGVO-konform)

function getCookieConsent(): CookieConsent | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

function setCookieConsent(consent: CookieConsent): void {
  if (typeof document === 'undefined') return
  const value = encodeURIComponent(JSON.stringify(consent))
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`
}

export function CookieSettingsDropdown({ isOpen }: CookieSettingsDropdownProps) {
  const [consent, setConsent] = useState<CookieConsent>({
    analytics: false,
    necessary: true,
  })

  // Load existing consent from cookie
  useEffect(() => {
    const savedConsent = getCookieConsent()
    if (savedConsent) {
      setConsent(savedConsent)
    }
  }, [])

  // Auto-save on analytics toggle
  const handleAnalyticsSwitch = (checked: boolean) => {
    const updated = { ...consent, analytics: checked }
    setConsent(updated)
    setCookieConsent(updated)

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
