'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastType } from '@/components/ui/Toast'

interface ToastData {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void
  showError: (title: string, message: string, duration?: number) => void
  showSuccess: (title: string, message: string, duration?: number) => void
  showInfo: (title: string, message: string, duration?: number) => void
  showWarning: (title: string, message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  showError: () => {},
  showSuccess: () => {},
  showInfo: () => {},
  showWarning: () => {},
})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, title: string, message: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const newToast: ToastData = { id, type, title, message, duration }

      setToasts((prev) => [...prev, newToast])
    },
    []
  )

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('error', title, message, duration)
    },
    [showToast]
  )

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('success', title, message, duration)
    },
    [showToast]
  )

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('info', title, message, duration)
    },
    [showToast]
  )

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('warning', title, message, duration)
    },
    [showToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo, showWarning }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-col gap-2 pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
