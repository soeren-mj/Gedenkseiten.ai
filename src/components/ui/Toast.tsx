'use client'

import { useEffect } from 'react'
import { XIcon } from '@/components/icons/XIcon'

export type ToastType = 'error' | 'success' | 'info' | 'warning'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  showIcon?: boolean
  onClose: (id: string) => void
}

export function Toast({ id, type, title, message, duration = 10000, showIcon = true, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-error-message border-message-error text-message-error'
      case 'success':
        return 'bg-message-success border-message-success text-message-success'
      case 'warning':
        return 'bg-warning-text/10 border-warning-text/30 text-warning-text'
      case 'info':
      default:
        return 'bg-interactive-info border-interactive-info text-interactive-info'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  return (
    // Outer container (frame effect like HubCard)
    <div
      className={`
        relative rounded-md shadow-card p-2 border border-main
        max-w-md w-full pointer-events-auto
        animate-in slide-in-from-top duration-3000
        ${getStyles()}
      `}
      role="alert"
    >
      {/* Inner container */}
      <div
        className={`
          flex flex-col items-start gap-4 p-3 rounded-sm
          
        `}
      >
        {showIcon && <div className="flex-shrink-0 text-xl mt-0.5">{getIcon()}</div>}

        <div className="flex flex-col gap-2 min-w-0">
          <h3 className="text-webapp-subsection">{title}</h3>
          <p className="text-body-m">{message}</p>
        </div>

      </div>

      {/* Close button - absolute top right */}
      <button
        onClick={() => onClose(id)}
        className="absolute top-3 right-3 p-1 rounded-xxs hover:bg-bw-opacity-10 transition-colors"
        aria-label="Schließen"
      >
        <XIcon variant="sm" className="w-4 h-4" />
      </button>
    </div>
  )
}
