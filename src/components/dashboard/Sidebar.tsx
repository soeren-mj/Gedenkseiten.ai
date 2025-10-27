'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import NavigationItem from '@/components/dashboard/NavigationItem'
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

  return (
    <div className="w-72 bg-bw-opacity-80 h-full flex flex-col rounded-l-md gap-3 p-4">
      {/* Account Section Header */}
      <div className="">
        <h5 className="text-tertiary">
          Konto
        </h5>
      </div>

      {/* User Profile Section - Clickable Navigation to Dashboard */}
      <div className="">
        <Link
          href="/dashboard"
          className={`
            flex items-center gap-3 p-1 rounded-lg
            transition-colors duration-200
            ${pathname === '/dashboard'
              ? 'bg-bw'
              : 'hover:bg-primary'
            }
          `}
        >
          {/* Avatar */}
          <InitialsAvatar
            name={user?.name || user?.email || 'U'}
            size="sm"
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

      {/* Navigation - Scrollable if content overflows */}
      <nav className="flex-1 overflow-y-auto">
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

      {/* Logout Section - Fixed at bottom */}
      <div className="p-4 border-t border-border-subtle">
        {showLogoutConfirm ? (
          <div className="space-y-2">
            <p className="text-desktop-body-xs text-secondary">
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
          <Button
            variant="tertiary"
            size="sm"
            fullWidth
            onClick={() => setShowLogoutConfirm(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
          >
            Abmelden
          </Button>
        )}
      </div>
    </div>
  )
}