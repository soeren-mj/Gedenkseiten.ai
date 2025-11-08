import React from 'react'

interface TooltipProps {
  text: string
  show: boolean
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({ text, show, className = '' }) => {
  return (
    <div
      className={`
        absolute
        -bottom-10
        left-1/2
        -translate-x-1/2
        px-3
        py-1.5
        bg-bw
        text-primary
        text-body-xs
        rounded-xs
        whitespace-nowrap
        pointer-events-none
        transition-all
        duration-200
        shadow-lg
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
        ${className}
      `}
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      {text}
      {/* Arrow pointing up */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-bw rotate-45"
      />
    </div>
  )
}
