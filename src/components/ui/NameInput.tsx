'use client'

import React, { useRef } from 'react'
import { cn } from '@/lib/utils'

interface NameInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
  value: string
  onChange: (value: string) => void
  onSave: (value: string) => Promise<void>
  loading?: boolean
  label?: string
}

export const NameInput: React.FC<NameInputProps> = ({
  value,
  onChange,
  onSave,
  loading = false,
  label,
  className,
  placeholder = 'Gib deinen Namen ein',
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasValue = value.length > 0

  const handleBlur = async () => {
    // Trigger auto-save
    await onSave(value)
  }

  const handleClear = async () => {
    onChange('')
    // Trigger save with empty value
    await onSave('')
    // Keep focus on input
    inputRef.current?.focus()
  }

  return (
    <div className={cn('w-full relative', className)}>
      {label && (
        <label className="block text-body-xs text-secondary mb-1 ml-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          disabled={loading}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xs border px-3 py-1 transition pr-10',
            'bg-bw-opacity-40',
            'text-body-s',
            'border-main',
            'focus:outline-none focus:ring-2',
            'focus:ring-background-interactive-primary-default',
            'focus:border-background-interactive-primary-default',
            'disabled:bg-secondary',
            'disabled:text-interactive-disabled',
            'disabled:cursor-not-allowed'
          )}
          {...props}
        />

        {/* Clear Button - Show when input has value and is focused or hovered */}
        {hasValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'w-5 h-5 rounded-full',
              'flex items-center justify-center',
              'text-tertiary hover:text-primary hover:bg-secondary',
              'transition-all duration-200'
            )}
            tabIndex={-1}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-background-interactive-primary-default border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  )
}
