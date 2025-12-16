'use client'

import { useState } from 'react'
import Link from 'next/link'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'
import { Badge } from '@/components/ui/Badge'

interface ChecklistItemProps {
  title: string
  description: string
  badge?: 'empfehlung' | 'premium'
  href: string
  checked?: boolean
  onComplete?: () => void
}

export default function ChecklistItem({
  title,
  description,
  badge,
  href,
  checked = false,
  onComplete,
}: ChecklistItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onComplete && !checked) {
      onComplete()
    }
  }

  return (
    <Link
      href={href}
      className={`
        block p-2 rounded-xs transition-all group
        ${isHovered ? 'bg-bw-opacity-40' : 'bg-transparent'}
        ${checked ? 'opacity-60' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Obere Zeile: Checkbox + Title + Badge | Arrow */}
      <div className="flex items-center gap-2">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={`
            w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
            ${checked
              ? 'bg-interactive-primary-default border-interactive-primary-default'
              : 'border-tertiary hover:border-primary'
            }
          `}
          aria-label={checked ? 'Erledigt' : 'Als erledigt markieren'}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Title + Badge */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className={`text-webapp-group ${checked ? 'line-through text-tertiary' : 'text-primary'}`}>
            {title}
          </span>
          {badge && !checked && (
            <Badge variant={badge}>
              {badge === 'empfehlung' ? 'Empfehlung' : 'Premium'}
            </Badge>
          )}
        </div>

        {/* Arrow */}
        <div
          className={`
            flex-shrink-0 transition-transform duration-200
            ${isHovered && !checked ? 'translate-x-1' : ''}
            ${checked ? 'opacity-30' : 'text-link-default'}
          `}
        >
          <ArrowRightIcon size={28} />
        </div>
      </div>

      {/* Untere Zeile: Description (eingerückt) */}
      <p className={`ml-7 mt-1 text-body-s ${checked ? 'text-tertiary' : 'text-secondary'}`}>
        {description}
      </p>
    </Link>
  )
}
