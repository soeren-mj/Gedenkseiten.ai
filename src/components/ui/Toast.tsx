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
  onClose: (id: string) => void
}

export function Toast({ id, type, title, message, duration = 10000, onClose }: ToastProps) {
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
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xs border backdrop-blur-md
        shadow-lg max-w-md w-full
        animate-in slide-in-from-top duration-300
        ${getStyles()}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 text-xl mt-0.5">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <h3 className="text-body-m font-semibold mb-1">{title}</h3>
        <p className="text-body-s opacity-90">{message}</p>
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-xxs hover:bg-bw-opacity-10 transition-colors"
        aria-label="Schließen"
      >
        <XIcon variant="sm" className="w-4 h-4" />
      </button>
    </div>
  )
}
