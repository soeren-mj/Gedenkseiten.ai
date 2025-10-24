'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useRequireAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-background-interactive-primary-default mx-auto mb-4"></div>
          <p className="text-desktop-body-m text-secondary">Dein Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-primary flex flex-col">
      {/* Header - Full Width */}
      <DashboardHeader />

      {/* Content Area Wrapper - with padding left, right, bottom (1.25rem = p-5) */}
      <div className="flex-1 flex pl-5 pr-5 pb-5 overflow-hidden">
        {/* Sidebar + Main Content Container */}
        <div className="flex flex-1 gap-0 rounded-md overflow-hidden">
          {/* Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Main Content - Scrollable */}
          <main className="flex-1 h-full p-5 bg-bw-opacity-40 overflow-y-auto min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}