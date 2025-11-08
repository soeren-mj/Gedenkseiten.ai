'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Sidebar } from '@/components/dashboard/Sidebar'
import Image from 'next/image'

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
    <div className="h-screen flex flex-col">
      {/* Background Image */}
      <div className="fixed inset-0 -z-1">
        <Image
          src="/images/Gedenkseiten-blur-79.webp"
          alt="Dashboard Background"
          fill
          className="object-cover object-center scale-125"
          priority
        />
      </div>

      {/* Content Area - Full Screen, No Padding */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Sidebar - 1/4 width */}
        <aside className="hidden md:block w-1/4">
          <Sidebar />
        </aside>

        {/* Main Content - 3/4 width, Scrollable */}
        <main className="w-3/4 h-full p-8 bg-bw-opacity-80 overflow-y-auto backdrop-blur-lg mb-4">
          {children}
        </main>
      </div>
    </div>
  )
}