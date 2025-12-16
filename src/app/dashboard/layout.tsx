'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import BackendHeader from '@/components/dashboard/BackendHeader'
import FeedbackButton from '@/components/ui/FeedbackButton'

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interactive-default mx-auto mb-4"></div>
          <p className="text-desktop-body-m text-secondary">Dein Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-dark-mode flex flex-col">
      {/* Header */}
      <BackendHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-x-visible overflow-y-auto px-6">
        {children}
      </main>

      {/* Sticky Feedback Button */}
      <FeedbackButton />
    </div>
  )
}