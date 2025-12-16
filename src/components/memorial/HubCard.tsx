'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface HubCardProps {
  /** SVG icon component */
  icon?: React.ReactNode;
  /** Text displayed as icon (e.g., "ABC" or a number) */
  textIcon?: string;
  /** Horizontal alignment of icon/textIcon */
  iconAlign?: 'start' | 'end';
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: 'inPlanung';
  className?: string;
}

/**
 * HubCard Component
 *
 * Reusable card for the memorial management hub area.
 * Supports two variants:
 * 1. icon: Renders a React node (SVG component)
 * 2. textIcon: Renders text (e.g., "ABC" or "5") in large blue font
 *
 * Features:
 * - Click handling via href or onClick
 * - Disabled state with "In Planung" badge
 * - Frame design matching MemorialCard
 */
export function HubCard({
  icon,
  textIcon,
  iconAlign = 'start',
  title,
  description,
  href,
  onClick,
  disabled = false,
  badge,
  className = '',
}: HubCardProps) {
  const isInteractive = !disabled && (href || onClick);

  const cardContent = (
    <>
      {/* Icon or Text Icon */}
      <div className={`w-full flex items-center h-[64px] ${iconAlign === 'end' ? 'justify-end' : 'justify-start'}`}>
        {textIcon ? (
          <span
            className={`
              font-satoshi font-regular text-[3rem] leading-none
              ${disabled ? 'text-interactive-disabled' : 'text-link-default'}
            `}
          >
            {textIcon}
          </span>
        ) : icon ? (
          <div className={disabled ? 'text-interactive-disabled' : 'text-link-default'}>
            {icon}
          </div>
        ) : null}
      </div>

      {/* Text Content */}
      <div className="flex-1 flex flex-col gap-1 mt-auto">
        <h3
          className={`
            text-webapp-body text-left line-clamp-2
            ${disabled ? 'text-interactive-disabled' : 'text-primary'}
          `}
        >
          {title}
        </h3>
        <p
          className={`
            text-body-m text-left line-clamp-3
            ${disabled ? 'text-interactive-disabled' : 'text-secondary'}
          `}
        >
          {description}
        </p>
      </div>
    </>
  );

  // Outer container classes (frame effect like MemorialCard)
  const outerClasses = `
    min-w-[247px] max-w-full aspect-square
    bg-bw-opacity-40 rounded-md shadow-card
    p-1 flex flex-col
    ${isInteractive ? 'cursor-pointer transition-all duration-200' : 'cursor-default'}
    ${className}
  `;

  // Badge element (positioned on outer frame, top center)
  const badgeElement = badge === 'inPlanung' && (
    <div className="w-full flex justify-center py-1">
      <Badge variant="soon">In Planung</Badge>
    </div>
  );

  // Inner container classes
  const innerClasses = `
    w-full h-full
    rounded-sm
    px-4 pt-4 pb-2
    flex flex-col gap-2
    ${disabled ? 'bg-interactive-primary-disabled pointer-events-none' : 'bg-light-dark-mode'}
  `;

  // Inner content wrapper
  const innerWrapper = (
    <div className={innerClasses}>
      {cardContent}
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={outerClasses}>
        {badgeElement}
        {innerWrapper}
      </Link>
    );
  }

  if (onClick && !disabled) {
    return (
      <button onClick={onClick} className={outerClasses} type="button">
        {badgeElement}
        {innerWrapper}
      </button>
    );
  }

  return (
    <div className={outerClasses}>
      {badgeElement}
      {innerWrapper}
    </div>
  );
}
