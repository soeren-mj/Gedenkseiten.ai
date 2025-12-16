'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastType } from '@/components/ui/Toast'

interface ToastData {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  showIcon?: boolean
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number, showIcon?: boolean) => void
  showError: (title: string, message: string, duration?: number, showIcon?: boolean) => void
  showSuccess: (title: string, message: string, duration?: number, showIcon?: boolean) => void
  showInfo: (title: string, message: string, duration?: number, showIcon?: boolean) => void
  showWarning: (title: string, message: string, duration?: number, showIcon?: boolean) => void
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
    (type: ToastType, title: string, message: string, duration?: number, showIcon?: boolean) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const newToast: ToastData = { id, type, title, message, duration, showIcon }

      setToasts((prev) => [...prev, newToast])
    },
    []
  )

  const showError = useCallback(
    (title: string, message: string, duration?: number, showIcon?: boolean) => {
      showToast('error', title, message, duration, showIcon)
    },
    [showToast]
  )

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number, showIcon?: boolean) => {
      showToast('success', title, message, duration, showIcon)
    },
    [showToast]
  )

  const showInfo = useCallback(
    (title: string, message: string, duration?: number, showIcon?: boolean) => {
      showToast('info', title, message, duration, showIcon)
    },
    [showToast]
  )

  const showWarning = useCallback(
    (title: string, message: string, duration?: number, showIcon?: boolean) => {
      showToast('warning', title, message, duration, showIcon)
    },
    [showToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo, showWarning }}>
      {children}

      {/* Toast Container - positioned under nav, 24px from right edge */}
      <div
        className="fixed right-6 z-50 flex flex-col gap-2 pointer-events-none"
        style={{ top: '64px' }}
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
              showIcon={toast.showIcon}
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
