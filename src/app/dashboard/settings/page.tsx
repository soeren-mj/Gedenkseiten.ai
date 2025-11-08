'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { NameInput } from '@/components/ui/NameInput'
import { Switch } from '@/components/ui/switch'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { CookieSettingsDropdown } from '@/components/ui/CookieSettingsDropdown'
import { EmailChangeModal } from '@/components/settings/EmailChangeModal'
import { AccountDeletionModal } from '@/components/settings/AccountDeletionModal'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { replaceAvatar, deleteAvatar as deleteAvatarFromStorage } from '@/lib/services/avatar-upload'
import { savePendingEmailChange, getPendingEmailChange, removePendingEmailChange } from '@/lib/pendingEmailStorage'
import { createClient } from '@/lib/supabase/client-legacy'

export default function SettingsPage() {
  const { user, authUser, updateUserName, updateUserAvatar, deleteUserAvatar, updateUserEmail, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [darkMode, setDarkMode] = useState(theme === 'dark')
  const [userName, setUserName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showCookieDropdown, setShowCookieDropdown] = useState(false)
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false)
  const [showAccountDeletionModal, setShowAccountDeletionModal] = useState(false)
  const [emailChangeSuccess, setEmailChangeSuccess] = useState<string | null>(null)
  const [isEmailChangeConfirmed, setIsEmailChangeConfirmed] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState({
    activities: true,
    releases: true,
    reminders: true,
    features: true
  })
  const cookieDropdownRef = useRef<HTMLDivElement>(null)

  // Initialize userName from user data
  useEffect(() => {
    if (user?.name) {
      setUserName(user.name)
    }
  }, [user?.name])

  // Restore pending email change from localStorage or authUser.new_email
  useEffect(() => {
    // Check localStorage first
    const pendingChange = getPendingEmailChange()
    if (pendingChange) {
      setEmailChangeSuccess(pendingChange.newEmail)
      setIsEmailChangeConfirmed(false)
      return
    }

    // Check if Supabase indicates a pending email change
    if (authUser?.new_email) {
      setEmailChangeSuccess(authUser.new_email)
      setIsEmailChangeConfirmed(false)
      // Also save to localStorage for persistence
      savePendingEmailChange(authUser.new_email)
    }
  }, [authUser?.new_email])

  // Check for email change success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('email_changed') === 'true') {
      // Get new email from URL parameter (more reliable than user?.email due to race conditions)
      const newEmail = urlParams.get('new_email') || user?.email || ''

      // Show confirmed success notification
      setEmailChangeSuccess(newEmail)
      setIsEmailChangeConfirmed(true)

      // Clear pending email change from localStorage
      removePendingEmailChange()

      // Refresh user data from AuthContext to update email display immediately
      refreshUser()

      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/settings')

      // Auto-hide after 10 seconds
      setTimeout(() => {
        setEmailChangeSuccess(null)
        setIsEmailChangeConfirmed(false)
      }, 10000)
    }
  }, [user?.email, refreshUser])

  // Close cookie dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cookieDropdownRef.current && !cookieDropdownRef.current.contains(event.target as Node)) {
        setShowCookieDropdown(false)
      }
    }

    if (showCookieDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCookieDropdown])

  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked)
    setTheme(checked ? 'dark' : 'light')
  }

  const handleCookieSettings = () => {
    setShowCookieDropdown(!showCookieDropdown)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return

    setUploadingAvatar(true)
    try {
      // Upload to Supabase Storage and get URL
      const result = await replaceAvatar(user.id, file, user.avatar_url)

      if (result.error) {
        console.error('Failed to upload avatar:', result.error)
        alert(result.error)
        return
      }

      // Update user profile with new avatar URL
      await updateUserAvatar(result.url)

      console.log('Avatar uploaded successfully')
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      alert('Fehler beim Hochladen des Bildes. Bitte versuche es erneut.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!user?.avatar_url) return

    setUploadingAvatar(true)
    try {
      // Delete from Supabase Storage
      const result = await deleteAvatarFromStorage(user.avatar_url)

      if (result.error) {
        console.error('Failed to delete avatar:', result.error)
        alert(result.error)
        return
      }

      // Update user profile to remove avatar URL
      await deleteUserAvatar()

      console.log('Avatar deleted successfully')
    } catch (error) {
      console.error('Failed to delete avatar:', error)
      alert('Fehler beim Löschen des Bildes. Bitte versuche es erneut.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleEmailChange = async (newEmail: string) => {
    await updateUserEmail(newEmail)

    // Save pending email change to localStorage (persists for 24 hours)
    savePendingEmailChange(newEmail)

    // Show pending confirmation message
    setEmailChangeSuccess(newEmail)
    setIsEmailChangeConfirmed(false)

    // No setTimeout - message persists until confirmed or 24h expired
  }

  const handleEmailChangeClick = () => {
    setShowEmailChangeModal(true)
  }

  const handleAccountDeletion = async (emailConfirmation: string) => {
    try {
      // Get auth token from Supabase session
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ emailConfirmation }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Account deletion failed:', {
          status: response.status,
          error: data.error,
          debug: data.debug,
          errorCode: data.errorCode,
        })

        // Show detailed error message
        const errorMsg = data.debug
          ? `${data.error}\n\nDetails: ${data.debug}${data.errorCode ? ` (${data.errorCode})` : ''}`
          : data.error || 'Failed to delete account'

        throw new Error(errorMsg)
      }

      // Account deleted successfully
      console.log('✅ Account deleted successfully')

      // Sign out the user (triggers SIGNED_OUT event in AuthContext)
      await supabase.auth.signOut()

      // Redirect to login with account_deleted reason
      window.location.href = '/auth/login?reason=account_deleted'
    } catch (error) {
      console.error('Account deletion failed:', error)
      throw error
    }
  }

  const handleAccountDeletionClick = () => {
    setShowAccountDeletionModal(true)
  }

  return (
    <div className="mx-auto max-w-4xl gap-8 flex flex-col">
     
     {/* Header */}
     <div className="flex flex-col gap-3">
      <h1 className="text-webapp-subsection">Einstellungen</h1>
     </div>

      {/* Avatar and Name */}
      <div className="flex flex-col gap-3 mb-4">
      

        <div className="flex gap-4 items-center">
          <InitialsAvatar
            name={user?.name || user?.email || 'U'}
            size="xl"
            imageUrl={user?.avatar_url}
            editable={true}
            onUpload={handleAvatarUpload}
            onDelete={handleAvatarDelete}
            isUploading={uploadingAvatar}
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
      <div className="flex flex-col gap-3">
      
       <div className="flex flex-col gap-1">
          <h2 className="text-webapp-body text-bw">Zugriffseinstellungen</h2>
          <div className="border-b border-main"></div>
        </div>

          {/* E-Mail-Adresse */}
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-[40rem]">
              <p className="text-webapp-group text-primary">
                E-Mail-Adresse
              </p>
              <p className="text-tertiary text-body-s">
                {user?.email || 'peter.williams@guugleemails.com'}
              </p>
            </div>
            <Button variant="tertiary" size="sm" onClick={handleEmailChangeClick}>
              E-Mail-Adresse ändern
            </Button>
          </div>

          {/* Email Change Success Message */}
          {emailChangeSuccess && (
            <div className={`p-5 rounded-md border ${
              isEmailChangeConfirmed
                ? 'bg-message-success border-message-success'
                : 'bg-interactive-info border-interactive-info'
            }`}>
              <p className={`text-body-m ${
                isEmailChangeConfirmed
                  ? 'text-message-success'
                  : 'text-interactive-info'
              }`}>
                {isEmailChangeConfirmed ? (
                  <>
                    ✅ Deine E-Mail-Adresse wurde erfolgreich zu <strong>{emailChangeSuccess}</strong> geändert.
                  </>
                ) : (
                  <>
                    Wir haben eine Bestätigungs-E-Mail an <strong>{emailChangeSuccess}</strong> gesendet. Bitte überprüfe dein Postfach und klicke auf den Link, um die Änderung abzuschließen.
                  </>
                )}
              </p>
            </div>
          )}

          {/* Passkey */}
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-[40rem] opacity-50">
              <p className="text-webapp-group text-primary">
                Passkey
              </p>
              <p className="text-tertiary text-body-s">
                Mit Passkey logst du dich zukünftig schneller und sicherer ein
              </p>
            </div>
            <Button variant="tertiary" size="sm" disabled>
              Bald verfügbar
            </Button>
          </div>
      </div>

      {/* Privatsphäre Section */}
      <div className="flex flex-col gap-3">

      <div className="flex flex-col gap-1">
          <h2 className="text-webapp-body text-bw">Privatsphäre</h2>
          <div className="border-b border-main"></div>
        </div>

         {/* Cookie Einstellungen */}
        <div className="relative" ref={cookieDropdownRef}>
          <div
            className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleCookieSettings}
          >
              <div className="flex-1 max-w-[40rem]">
                <p className="text-webapp-group text-primary">
                Cookie Einstellungen
                </p>
                <p className="text-tertiary text-body-s">
                  Stelle deine Cookies ein. Mehr Details findest du in den{' '}
                <a
                  href="/datenschutz"
                  className="text-interactive-primary-default underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Datenschutzbestimmungen
                </a>
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

          <CookieSettingsDropdown
            isOpen={showCookieDropdown}
            onClose={() => setShowCookieDropdown(false)}
          />
        </div>
        </div>

      {/* E-Mail-Benachrichtigungen Section */}
      <div className="flex flex-col gap-3">

        <div className="flex flex-col gap-1">
          <h2 className="text-webapp-body text-bw">E-Mail-Benachrichtigungen</h2>
          <div className="border-b border-main"></div>
        </div>

        {/* Aktivitäten */}
        <div className="flex items-center justify-between hidden">
          <div className="flex-1 max-w-[40rem]">
            <p className="text-webapp-group text-primary">
              Aktivitäten auf deinen Gedenkseiten
            </p>
            <p className="text-tertiary text-body-s">
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
        <div className="flex items-center justify-between hidden">
          <div className="flex-1 max-w-[40rem]">
            <p className="text-webapp-group text-primary">
              Freigaben
            </p>
            <p className="text-tertiary text-body-s">
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
        <div className="flex items-center justify-between hidden">
          <div className="flex-1 max-w-[40rem]">
            <p className="text-webapp-group text-primary">
              Erinnerungen
            </p>
            <p className="text-tertiary text-body-s">
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
          <div className="flex-1 max-w-[40rem]">
            <p className="text-webapp-group text-primary">
              Neue Funktionen
            </p>
            <p className="text-tertiary text-body-s">
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

      {/* Darstellung Section */}
      <div className="flex flex-col gap-3">

        <div className="flex flex-col gap-1">
          <h2 className="text-webapp-body text-bw">Darstellung</h2>
          <div className="border-b border-main"></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-[40rem]">
            <p className="text-webapp-group text-primary">
              Dark Mode
            </p>
            <p className="text-tertiary text-body-s">
              Die Darstellung wird anhand der Browser-Einstellung gewählt. Die Standard-Einstellung ist Light Mode. Du kannst die Einstellung hier nach belieben anpassen.
            </p>
          </div>
          <Switch
            variant="theme"
            checked={darkMode}
            onCheckedChange={handleThemeToggle}
          />
        </div>
      </div>

      {/* Support Section */}
      <div className="flex flex-col gap-3">

        <div className="flex flex-col gap-1">
          <h2 className="text-webapp-body text-bw">Support</h2>
          <div className="border-b border-main"></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-[40rem]">
            <p className="text-webapp-group text-primary">
              Konto-ID
            </p>
            <p className="text-tertiary text-body-s font-mono">
              {user?.id || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'}
            </p>
          </div>
        </div>

        {/* Konto löschen */}
        <div
          className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleAccountDeletionClick}
        >
          <div className="flex-1 max-w-[40rem]">
            <p className="text-webapp-group text-accent-red">
              Konto löschen
            </p>
            <p className="text-tertiary text-body-s">
              Achtung: Hier löst du deinen Account dauerhaft und alle damit verbundenen Einträge und Seiten. Alternativ kannst du Seiten übertragen, wenn du das willst.
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

      {/* Email Change Modal */}
      <EmailChangeModal
        isOpen={showEmailChangeModal}
        currentEmail={user?.email || ''}
        onClose={() => setShowEmailChangeModal(false)}
        onSubmit={handleEmailChange}
      />

      {/* Account Deletion Modal */}
      <AccountDeletionModal
        isOpen={showAccountDeletionModal}
        userEmail={user?.email || ''}
        userName={user?.name || null}
        userAvatar={user?.avatar_url || null}
        accountType="free"
        onClose={() => setShowAccountDeletionModal(false)}
        onConfirm={handleAccountDeletion}
      />

    </div>
  )
}