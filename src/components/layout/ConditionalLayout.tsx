'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { MainFooter } from '@/components/layout/MainFooter'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Hide navbar and footer on auth, dashboard, memorial creation wizard, and management pages
  const isAuthPage = pathname.startsWith('/auth')
  const isDashboardPage = pathname.startsWith('/dashboard')
  const isMemorialCreationPage = pathname.startsWith('/gedenkseite/neu')
  const isMemorialManagementPage = pathname.includes('/verwalten')
  const hideNavAndFooter = isAuthPage || isDashboardPage || isMemorialCreationPage || isMemorialManagementPage

  if (hideNavAndFooter) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <MainFooter />
    </>
  )
}