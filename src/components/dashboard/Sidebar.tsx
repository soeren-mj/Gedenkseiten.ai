'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import NavigationItem from '@/components/dashboard/NavigationItem'
import MenuPowerLink from '@/components/ui/MenuPowerLink'
import { useState } from 'react'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  badge?: {
    text: string
    bgColor: string
    textColor: string
  }
}

const navItems: NavItem[] = [
  {
    href: '/dashboard/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Einstellungen'
  }
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowLogoutConfirm(false)
  }

  const handleShareClick = () => {
    // Placeholder for share modal
    console.log('Share modal will be implemented here')
  }

  return (
    <div className="w-full bg-bw-opacity-40 h-full flex flex-col p-6 gap-10 backdrop-blur-md">
      {/* LOGO SECTION */}
      <div className="flex items-center gap-2">
        <Image
          src="/images/logo-gedenkseiten.ai-white-x4.png"
          alt="Gedenkseiten.ai"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <span className="text-primary font-satoshi text-lg font-medium">
          Gedenkseiten.ai
        </span>
      </div>

      {/* EXISTING CONTENT SECTION - fills remaining space */}
      <div className="flex-1 flex flex-col">
        {/* TOP SECTION: Account Header + User Profile + Navigation */}
        <div className="space-y-3">
        {/* Account Section Header */}
        <div>
          <h5 className="text-webapp-group text-tertiary">
            Konto
          </h5>
        </div>

        {/* User Profile Section - Clickable Navigation to Dashboard */}
        <div>
          <Link
            href="/dashboard"
            className={`
              flex items-center gap-3 p-1 rounded-lg
              transition-colors duration-200
              ${pathname === '/dashboard'
                ? 'bg-bw'
                : 'hover:bg-bw-opacity-60'
              }
            `}
          >
            {/* Avatar */}
            <InitialsAvatar
              name={user?.name || user?.email || 'U'}
              size="sm"
              imageUrl={user?.avatar_url}
            />

            {/* User Info */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <p className="text-webapp-group truncate">
                {user?.name || user?.email}
              </p>
              <span className="py-1 px-1.5 rounded-xs text-chip font-semibold bg-accent-purple">
                DASHBOARD
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <NavigationItem
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={isActive}
                    badge={item.badge}
                  />
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* BOTTOM SECTION: Power Links + Logout */}
        <div className="space-y-1">
        {/* Memorial Journey teilen */}
        <MenuPowerLink
          onClick={handleShareClick}
          headline="Gedenkseiten teilen"
          subline="Lade Personen zu deinen Gedenkseiten ein, um Teilhabe zu erhalten"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        />

        {/* Premium Account */}
        <MenuPowerLink
          href="/dashboard/premium"
          headline="Premium Account"
          subline="Erlebe die Vorteile des Premium Accounts heraus"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          }
        />

        {/* Hilfe und Support */}
        <MenuPowerLink
          href="/dashboard/support"
          headline="Hilfe und Support"
          subline="Lerne wie Gedenkseiten erstellt und verwaltet werden"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

        {/* Abmelden Section */}
        <div>
          {showLogoutConfirm ? (
            <div className="space-y-2">
              <p className="text-body-xs text-secondary px-3">
                Wirklich abmelden?
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="negative"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex-1"
                >
                  Ja
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1"
                >
                  Nein
                </Button>
              </div>
            </div>
          ) : (
            <MenuPowerLink
              onClick={() => setShowLogoutConfirm(true)}
              headline="Abmelden"
              showTopBorder
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              }
            />
          )}
        </div>
        </div>
      </div>
    </div>
  )
}